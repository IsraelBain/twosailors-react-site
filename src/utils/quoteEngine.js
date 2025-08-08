// Uses your existing configs exactly.
import pricing from "../config/pricing.json";
import consumption from "../config/consumption.json";
import suppliers from "../config/suppliers.json";
import yields from "../config/yields.json";
import recipes from "../config/recipes.json";

function toCurrency(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function sumObj(map, key, add) {
  map[key] = (map[key] || 0) + add;
}

// Normalize ingredient names (so suppliers/yields line up)
const aliasMap = {
  // Canada: treat Bourbon as Rye in purchasing
  "Bourbon": "Rye",
  // normalize Prosecco bottle naming for supplier lookup
  "Prosecco": "Prosecco (750ml)"
};

export default function quoteEngine(formData) {
  const {
    name = "",
    email = "",
    date = "",
    occasion = "",
    barServiceHours = 6, // If you keep "4PM-12AM", we fall back to minimum hours
    liquorProvider = "",
    guests = 0,
    location = "",
    budget = "",
    barType = "Open Bar",
    spirits = "",
    beerWine = "",
    cupPreference = "",
    specialRequests = "",
    referralSource = "",
    cocktails = [],
    drinksPerGuest = 3,
    crowdType = "standard_lean_beer",
    km = 0
  } = formData;

  // ---- Labor / Fees based on your pricing.json ----
  const bartenderCount = Math.max(1, Math.ceil(guests / 60)); // simple rule, tweak later if you like
  const serviceHoursNum = typeof barServiceHours === "number"
    ? barServiceHours
    : (pricing.minimum_hours || 3); // fallback if time string; add a parser later if you want

  const baseRate = barType === "Open Bar" ? pricing.open_bar_rate : pricing.cash_bar_rate;

  const laborHours =
    Number(serviceHoursNum) +
    pricing.setup_teardown_hours_per_bartender.before +
    pricing.setup_teardown_hours_per_bartender.after;

  const laborCost = baseRate * bartenderCount * laborHours;

  const prepHours = Math.min(
    barType === "Open Bar" ? pricing.prep.default_hours.open_bar : pricing.prep.default_hours.cash_bar,
    pricing.prep.max_hours
  );
  const prepCost = pricing.prep.enabled ? (pricing.prep.rate_per_hour * prepHours) : 0;

  const fees =
    pricing.booking_fee +
    pricing.insurance_fee +
    (pricing.travel_rate_per_km * (Number(km) || 0));

  // ---- Product math (Open Bar only) ----
  const need = {}; // normalized needs: "Vodka (oz)", "Limes (each)", etc.
  let beerCount = 0;
  let wineGlasses = 0;

  if (barType === "Open Bar" && guests > 0) {
    const split = consumption.presets[crowdType] || consumption.presets.standard_lean_beer;
    const totalDrinks = guests * drinksPerGuest * (1 + (consumption.buffer || 0));
    const cocktailCount = Math.round(totalDrinks * split.cocktails);
    beerCount = Math.round(totalDrinks * split.beer);
    wineGlasses = Math.round(totalDrinks * split.wine);

    // Wine bottles (generic — you can split red/white later)
    const wineBottles = Math.ceil(wineGlasses / yields.wine["750ml_glasses_5oz"]);
    sumObj(need, "Wine (750ml)", wineBottles);

    // Beer cans
    sumObj(need, "Beer (cans)", beerCount);

    // Cocktails distributed evenly across selected list
    const eachCocktailServes = (cocktails && cocktails.length) ? cocktailCount / cocktails.length : 0;

    (cocktails || []).forEach(cName => {
      const rec = recipes[cName];
      if (!rec || !rec.ingredients) return;

      Object.entries(rec.ingredients).forEach(([ing, spec]) => {
        const { unit, qty } = spec; // "oz" | "each" | "dash"
        const normalized = aliasMap[ing] || ing;
        const total = qty * eachCocktailServes;

        if (unit === "oz") {
          sumObj(need, `${normalized} (oz)`, total);
        } else if (unit === "each") {
          sumObj(need, `${normalized} (each)`, total);
        } else if (unit === "dash") {
          sumObj(need, `${normalized} (dash)`, total);
        }
      });
    });

    // Ice (lbs)
    const iceLbs = Math.ceil((yields.other?.ice_lbs_per_guest || 1.5) * guests);
    sumObj(need, "Ice (lbs)", iceLbs);
  }

  // ---- Convert normalized needs -> purchasable shopping list ----
  const one14oz = yields.spirits["1_14L_bottle_oz"];   // 1.14L bottle oz
  const seven50oz = yields.spirits["750ml_bottle_oz"]; // 750ml bottle oz
  const literOz = 33.8;
  const syrup1LBottleOz = yields.syrups["1L_bottle_oz"] || 33.8;

  const spirits114 = new Set(["Vodka", "Gin", "White Rum", "Dark Rum"]);
  const spirits750 = new Set(["Tequila", "Triple Sec", "Coffee Liqueur", "Rye", "Aperol", "Prosecco (750ml)"]);

  const shoppingList = [];

  Object.entries(need).forEach(([key, qty]) => {
    // ex: "Vodka (oz)", "Lime Juice (oz)", "Raspberry (each)", "Ice (lbs)", "Wine (750ml)", "Beer (cans)"
    const match = key.match(/^(.+)\s\((.+)\)$/);
    const base = match ? match[1] : key;
    const unit = match ? match[2] : "";

    // Wine & Beer already in purchasable units
    if (base === "Wine (750ml)") {
      shoppingList.push({ item: "Wine (750ml)", quantity: qty, unit: "bottles" });
      return;
    }
    if (base === "Beer (cans)") {
      shoppingList.push({ item: "Beer (cans)", quantity: qty, unit: "cans" });
      return;
    }
    if (base === "Ice") {
      shoppingList.push({ item: "Ice", quantity: qty, unit: "lbs" });
      return;
    }

    // Spirits & wine-like bottles: convert oz -> bottles
    if (unit === "oz" && (base in (suppliers.spirits || {}) || base in (suppliers.wine || {}) || spirits114.has(base) || spirits750.has(base))) {
      const nameForBottle = base; // already aliased above (e.g., Prosecco -> Prosecco (750ml), Bourbon -> Rye)
      const bottleOz = spirits114.has(nameForBottle) ? one14oz : seven50oz;
      const bottles = Math.ceil(qty / bottleOz);
      shoppingList.push({ item: nameForBottle, quantity: bottles, unit: "bottles" });
      return;
    }

    // Mixers (juices, sodas): oz -> liters
    if (unit === "oz" && (suppliers.mixers && suppliers.mixers[base])) {
      const liters = Math.ceil(qty / literOz);
      shoppingList.push({ item: base, quantity: liters, unit: "L" });
      return;
    }

    // Syrups: oz -> 1L bottles
    if (unit === "oz" && (suppliers.syrups && suppliers.syrups[base])) {
      const bottles = Math.ceil(qty / syrup1LBottleOz);
      shoppingList.push({ item: base, quantity: bottles, unit: "1L bottles" });
      return;
    }

    // Garnishes:
    if (unit === "each") {
      if (base === "Lime Wedge") {
        const perLime = yields.garnish.lime_wedges_per_lime || 8;
        const limes = Math.ceil(qty / perLime);
        shoppingList.push({ item: "Limes", quantity: limes, unit: "pcs" });
        return;
      }
      if (base === "Lime Wheels") {
        const perLime = yields.garnish.lime_wheels_per_lime || 7;
        const limes = Math.ceil(qty / perLime);
        shoppingList.push({ item: "Limes", quantity: limes, unit: "pcs" });
        return;
      }
      if (base === "Lemon Wheels") {
        const per = yields.garnish.lemon_half_wheels_per_lemon || 12;
        const lemons = Math.ceil(qty / per);
        shoppingList.push({ item: "Lemons", quantity: lemons, unit: "pcs" });
        return;
      }
      if (base === "Orange Wheels" || base === "Orange Slice") {
        const per = yields.garnish.orange_half_wheels_per_orange || 12;
        const oranges = Math.ceil(qty / per);
        shoppingList.push({ item: "Oranges", quantity: oranges, unit: "pcs" });
        return;
      }
      if (base === "Raspberry") {
        const perBox = yields.garnish.raspberries_per_box || 36;
        const boxes = Math.ceil(qty / perBox);
        shoppingList.push({ item: "Raspberries", quantity: boxes, unit: "boxes" });
        return;
      }
      if (base === "Mint Leaves") {
        const perBunch = yields.garnish.mint_leaves_per_bunch || 50;
        const bunches = Math.ceil(qty / perBunch);
        shoppingList.push({ item: "Mint (bunches)", quantity: bunches, unit: "bunches" });
        return;
      }
      if (base === "Salt Rim") {
        // Assume 1 salt rim per drink = 1 "each" — buy 1x 1kg tub per 100 rims as a rough default (optional)
        shoppingList.push({ item: "Rimming Salt", quantity: Math.ceil(qty / 100) || 1, unit: "1kg tubs" });
        return;
      }
      // Default: keep each
      shoppingList.push({ item: base, quantity: Math.ceil(qty), unit: "each" });
      return;
    }

    // Dashes (e.g., Angostura Bitters)
    if (unit === "dash") {
      // very low volume usage; just ensure 1 bottle if any dashes present
      shoppingList.push({ item: base, quantity: 1, unit: "bottle" });
      return;
    }

    // Fallback
    shoppingList.push({ item: base, quantity: Math.ceil(qty), unit });
  });

  // ---- Group by supplier (using your suppliers.json) ----
  const ordersBySupplier = [];
  const supplierIndex = {}; // supplier+item+unit -> row index

  function pushOrder(supplierName, item, quantity, unit, cost = "") {
    const key = `${supplierName}__${item}__${unit}`;
    if (!(key in supplierIndex)) {
      supplierIndex[key] = ordersBySupplier.length;
      ordersBySupplier.push({ supplier: supplierName, item, quantity, unit, cost });
    } else {
      ordersBySupplier[supplierIndex[key]].quantity += quantity;
    }
  }

  shoppingList.forEach(({ item, quantity, unit }) => {
    let supplierName = "Other";

    // Try category maps
    const categories = Object.keys(suppliers);
    for (const cat of categories) {
      const catMap = suppliers[cat];
      if (catMap && catMap[item]) {
        supplierName = catMap[item];
        break;
      }
    }

    // Produce / fallback routing (covers Limes/Lemons/Oranges/Mint/Raspberries if not in suppliers)
    if (supplierName === "Other") {
        // produce
        if (["Limes", "Lemons", "Oranges", "Raspberries"].includes(item)) supplierName = "Costco";
        if (item === "Mint (bunches)") supplierName = "Barjus";
      
        // bar staples
        if (item === "Rimming Salt") supplierName = "Costco";
        if (item === "Angostura Bitters") supplierName = "NSLC";
        if (item === "Aperol") supplierName = "NSLC";
      
        // generic wine routing (until you split red/white)
        if (item === "Wine (750ml)") supplierName = "Lost Bell Winery";
      }

    pushOrder(supplierName, item, quantity, unit);
  });

  // ---- Totals (labor+prep+fees). Product cost awaits SKU pricing (optional next step) ----
  const totalCost = laborCost + prepCost + fees;

  // ---- HTML tables (for EmailJS) ----
  const costTableHTML = `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><th>Labor</th><th>Prep</th><th>Fees</th><th>Total (no product)</th></tr>
      <tr>
        <td>${toCurrency(laborCost)}</td>
        <td>${toCurrency(prepCost)}</td>
        <td>${toCurrency(fees)}</td>
        <td><strong>${toCurrency(totalCost)}</strong></td>
      </tr>
    </table>
  `;

  const shoppingListHTML = `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
      <thead><tr style="background:#f2f2f2;"><th>Item</th><th>Quantity</th><th>Unit</th></tr></thead>
      <tbody>
        ${shoppingList.map(i => `<tr><td>${i.item}</td><td>${i.quantity}</td><td>${i.unit}</td></tr>`).join("")}
      </tbody>
    </table>
  `;

  const ordersBySupplierHTML = `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;">
      <thead><tr style="background:#f2f2f2;"><th>Supplier</th><th>Item</th><th>Quantity</th><th>Unit</th><th>Cost</th></tr></thead>
      <tbody>
        ${ordersBySupplier.map(o => `<tr><td>${o.supplier}</td><td>${o.item}</td><td>${o.quantity}</td><td>${o.unit}</td><td>${o.cost || ""}</td></tr>`).join("")}
      </tbody>
    </table>
  `;

  // Client-facing email block
  const clientEmail = `
Hi ${name},

Thank you for your inquiry — we’d be honoured to serve your event.

Based on your details:
• Guests: ${guests}
• Bar Type: ${barType}
• Cocktails: ${Array.isArray(cocktails) ? cocktails.join(", ") : "N/A"}

Here’s your quote (labor, prep & fees — product is estimated below):

${costTableHTML}

We’re happy to jump on a quick call to refine the menu or adjust quantities.

Menu & Pricing: https://www.twosailorsbartending.ca/menu

Cheers,
Two Sailors Bartending
  `.trim();

  return {
    // Arrays for your current {{#each}} template (if you keep it)
    shoppingList,
    ordersBySupplier,

    // Formatted cost strings (your template uses ${{laborCost}}, so no $ here)
    laborCost: Number(laborCost).toFixed(2),
    prepCost: Number(prepCost).toFixed(2),
    fees: Number(fees).toFixed(2),
    totalCost: Number(totalCost).toFixed(2),

    // Helpful strings for template
    cocktails: Array.isArray(cocktails) ? cocktails.join(", ") : "",
    clientEmail,
    costTableHTML,
    shoppingListHTML,
    ordersBySupplierHTML,

    // Raw debug JSON
    quoteDetails: JSON.stringify({
      name, email, date, occasion, barServiceHours, liquorProvider, guests, location,
      budget, barType, spirits, beerWine, cupPreference, specialRequests, referralSource,
      cocktails, drinksPerGuest, crowdType, km
    }, null, 2)
  };
}
