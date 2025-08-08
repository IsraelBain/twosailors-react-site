// quoteEngine.js — Final Working Version
import pricing from "../config/pricing.json";
import consumption from "../config/consumption.json";
import suppliers from "../config/suppliers.json";
import yields from "../config/yields.json";
import recipes from "../config/recipes.json";
// Optional cost file. If missing, costing quietly disables.
import sku from "../config/sku_prices.json";

const num = (v, d = 0) => {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n : d;
  };
  console.log("[TwoSailors] quoteEngine v2.2 loaded");
  

function toCurrency(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function sumObj(map, key, add) {
  map[key] = (map[key] || 0) + add;
}

function ceil(n) {
  return Math.ceil(Number(n || 0));
}

// Aliases to match supplier/SKU names
const aliasMap = {
  Bourbon: "Rye",
  Prosecco: "Prosecco (750ml)"
};

// Defaults that can be overridden in pricing.json
const railSplit = pricing?.rail_split || { Vodka: 0.4, "White Rum": 0.3, Gin: 0.2, Rye: 0.1 };
const mixerSplit = pricing?.mixer_split || {
  "Coke": 0.30,
  "Diet Coke": 0.10,
  "Ginger Ale": 0.20,
  "Sprite": 0.15,
  "Soda Water": 0.15,
  "Tonic Water": 0.10
};
const wineSplit = pricing?.wine_split || { white: 0.6, red: 0.4 };
// How much of the mixed-drink share becomes “specialty cocktails” when cocktails=Yes
const specialtyCocktailFraction = typeof pricing?.specialty_cocktail_fraction === "number"
  ? pricing.specialty_cocktail_fraction
  : 0.4;

// Per-drink volumes (adjustable)
const OZ_PER_HIGHBALL_SPIRIT = pricing?.oz_per_highball_spirit || 1.5;
const OZ_PER_HIGHBALL_MIXER  = pricing?.oz_per_highball_mixer  || 4.0;

export default function quoteEngine(formData) {
  const {
    name = "",
    email = "",
    date = "",
    occasion = "",
    barServiceHours = 6, // number of service hours only
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
    drinksPerGuest = 6,
    // crowdType will be passed from the Landing Page (derived). We also auto-derive below if it's missing.
    crowdType: crowdTypeInput,
    km = 0,
    wantsCocktails = false
  } = formData;

  // ---- Derive crowdType if not provided (safety) ----
  let crowdType = crowdTypeInput;
  if (!crowdType) {
    if (barType === "Open Bar") {
      crowdType = wantsCocktails ? "heavy_cocktail" : "wedding_40_35_25";
    } else {
      crowdType = "cash_bar";
    }
  }

// ---- Labor / Fees ----
const bartenderCount = Math.max(1, Math.ceil(num(guests) / 60));
const serviceHoursNum = num(barServiceHours, pricing.minimum_hours || 3);
// Always add 1hr setup + 1hr teardown
const totalLaborHours = serviceHoursNum + 2;

const baseRate = (barType === "Open Bar")
  ? num(pricing.open_bar_rate, 60)
  : num(pricing.cash_bar_rate, 75);

const laborCost = baseRate * bartenderCount * totalLaborHours;

const prepCfg = pricing?.prep || {
  enabled: true,
  rate_per_hour: 30,
  default_hours: { cash_bar: 2, open_bar: 3 },
  max_hours: 3
};

const prepHours = Math.min(
  barType === "Open Bar"
    ? num(prepCfg.default_hours?.open_bar, 3)
    : num(prepCfg.default_hours?.cash_bar, 2),
  num(prepCfg.max_hours, 3)
);
const prepCost = prepCfg.enabled ? (num(prepCfg.rate_per_hour, 30) * prepHours) : 0;

const fees =
  num(pricing.booking_fee) +
  num(pricing.insurance_fee) +
  (num(pricing.travel_rate_per_km) * num(km));

  // ---- Product Math (Unified for Open/Cash) ----
  const need = {}; // normalized needs: "Vodka (oz)", "Coke (oz)", "Ice (lbs)", "Red Wine (750ml)" etc.

  if (guests > 0) {
    const split = consumption.presets[crowdType] || consumption.presets.wedding_40_35_25;
    const totalDrinks = guests * drinksPerGuest * (1 + (consumption.buffer || 0));

    // "Mixed" = highballs + specialty cocktails
    const mixedDrinks = Math.round(totalDrinks * (split.cocktails || 0));
    const beerDrinks  = Math.round(totalDrinks * (split.beer || 0));
    const wineGlasses = Math.round(totalDrinks * (split.wine || 0));

    // For cocktails toggle: portion of mixed that are specialty cocktails vs highballs
    const cocktailCount = wantsCocktails ? Math.round(mixedDrinks * specialtyCocktailFraction) : 0;
    const highballCount = mixedDrinks - cocktailCount;

    // ---- Wine bottles (split white/red) ----
    const wineBottlesTotal = Math.ceil(wineGlasses / (yields.wine?.["750ml_glasses_5oz"] || 5));
    const whiteBottles = Math.max(0, Math.round(wineBottlesTotal * (wineSplit.white || 0.6)));
    const redBottles   = Math.max(0, wineBottlesTotal - whiteBottles);
    if (whiteBottles > 0) sumObj(need, "White Wine (750ml) (bottle)", whiteBottles);
    if (redBottles   > 0) sumObj(need, "Red Wine (750ml) (bottle)",   redBottles);

    // ---- Beer (cans)
    if (beerDrinks > 0) sumObj(need, "Beer (cans) (can)", beerDrinks);

    // ---- Highballs: spirits + mixers
    if (highballCount > 0) {
      // Spirits oz total
      const totalSpiritOz = OZ_PER_HIGHBALL_SPIRIT * highballCount;
      const railKeys = Object.keys(railSplit);
      railKeys.forEach(sp => {
        const pct = railSplit[sp] || 0;
        const oz = totalSpiritOz * pct;
        if (oz > 0) sumObj(need, `${sp} (oz)`, oz);
      });

      // Mixers oz total
      const totalMixerOz = OZ_PER_HIGHBALL_MIXER * highballCount;
      const mixerKeys = Object.keys(mixerSplit);
      mixerKeys.forEach(mx => {
        const pct = mixerSplit[mx] || 0;
        const oz = totalMixerOz * pct;
        if (oz > 0) sumObj(need, `${mx} (oz)`, oz);
      });
    }

    // ---- Specialty cocktails: split evenly across selected list
    if (cocktailCount > 0 && Array.isArray(cocktails) && cocktails.length) {
      const each = cocktailCount / cocktails.length;
      cocktails.forEach(cName => {
        const rec = recipes[cName];
        if (!rec || !rec.ingredients) return;
        Object.entries(rec.ingredients).forEach(([ing, spec]) => {
          const normalized = aliasMap[ing] || ing;
          const qty = Number(spec.qty || 0) * each;
          const unit = spec.unit;
          sumObj(need, `${normalized} (${unit})`, qty);
        });
      });
    }

    // ---- Ice
    const iceLbs = (yields.other?.ice_lbs_per_guest || 1.5) * guests;
    sumObj(need, "Ice (lbs)", iceLbs);
  }

  // ---- Convert "need" -> Shopping List ----
  const shoppingList = [];
  const one14oz = yields.spirits?.["1_14L_bottle_oz"] || 38;
  const seven50oz = yields.spirits?.["750ml_bottle_oz"] || 25;
  const literOz = 33.8;
  const syrup1LBottleOz = yields.syrups?.["1L_bottle_oz"] || 33.8;

  const spirits114 = new Set(["Vodka", "Gin", "White Rum", "Dark Rum"]);
  const spirits750 = new Set(["Tequila", "Triple Sec", "Coffee Liqueur", "Rye", "Aperol", "Prosecco (750ml)"]);

  Object.entries(need).forEach(([key, qty]) => {
    const match = key.match(/^(.+)\s\((.+)\)$/); // "Base (unit)"
    const base = match ? match[1] : key;
    const unit = match ? match[2] : "";

    // Wine bottles by color
    if (base === "White Wine (750ml)" || base === "Red Wine (750ml)") {
      shoppingList.push({ item: base, quantity: ceil(qty), unit: "bottle" });
      return;
    }

    // Beer cans
    if (base === "Beer (cans)") {
      shoppingList.push({ item: base, quantity: ceil(qty), unit: "can" });
      return;
    }

    // Ice
    if (base === "Ice") {
      shoppingList.push({ item: base, quantity: ceil(qty), unit: "lbs" });
      return;
    }

    // Spirits to bottles
    if (unit === "oz" && (spirits114.has(base) || spirits750.has(base))) {
      const bottleOz = spirits114.has(base) ? one14oz : seven50oz;
      shoppingList.push({ item: base, quantity: ceil(qty / bottleOz), unit: "bottle" });
      return;
    }

    // Mixers (juices/sodas): oz -> L
    if (unit === "oz" && (suppliers.mixers && suppliers.mixers[base])) {
      shoppingList.push({ item: base, quantity: ceil(qty / literOz), unit: "L" });
      return;
    }

    // Syrups: oz -> 1L bottles
    if (unit === "oz" && (suppliers.syrups && suppliers.syrups[base])) {
      shoppingList.push({ item: base, quantity: ceil(qty / syrup1LBottleOz), unit: "1L bottle" });
      return;
    }

    // Garnish conversions
    if (unit === "each") {
      if (base === "Lime Wedge") {
        const perLime = yields.garnish?.lime_wedges_per_lime || 8;
        shoppingList.push({ item: "Limes", quantity: ceil(qty / perLime), unit: "pcs" });
        return;
      }
      if (base === "Lime Wheels") {
        const per = yields.garnish?.lime_wheels_per_lime || 7;
        shoppingList.push({ item: "Limes", quantity: ceil(qty / per), unit: "pcs" });
        return;
      }
      if (base === "Lemon Wheels") {
        const per = yields.garnish?.lemon_half_wheels_per_lemon || 12;
        shoppingList.push({ item: "Lemons", quantity: ceil(qty / per), unit: "pcs" });
        return;
      }
      if (base === "Orange Wheels" || base === "Orange Slice") {
        const per = yields.garnish?.orange_half_wheels_per_orange || 12;
        shoppingList.push({ item: "Oranges", quantity: ceil(qty / per), unit: "pcs" });
        return;
      }
      if (base === "Raspberry") {
        const perBox = yields.garnish?.raspberries_per_box || 36;
        shoppingList.push({ item: "Raspberries", quantity: ceil(qty / perBox), unit: "box" });
        return;
      }
      if (base === "Mint Leaves") {
        const perBunch = yields.garnish?.mint_leaves_per_bunch || 50;
        shoppingList.push({ item: "Mint (bunches)", quantity: ceil(qty / perBunch), unit: "bunch" });
        return;
      }
      if (base === "Salt Rim") {
        shoppingList.push({ item: "Rimming Salt", quantity: Math.max(1, ceil(qty / 100)), unit: "1kg tub" });
        return;
      }
      // default
      shoppingList.push({ item: base, quantity: ceil(qty), unit: "each" });
      return;
    }

    // Dashes (bitters etc.) -> 1 bottle
    if (unit === "dash") {
      shoppingList.push({ item: base, quantity: 1, unit: "bottle" });
      return;
    }

    // Fallback: pass through
    shoppingList.push({ item: base, quantity: ceil(qty), unit });
  });

  // ---- Orders by Supplier ----
  const ordersBySupplier = [];
  const supplierIndex = {};

  function pushOrder(supplierName, item, quantity, unit, lineCost = null) {
    const key = `${supplierName}__${item}__${unit}`;
    if (!(key in supplierIndex)) {
      supplierIndex[key] = ordersBySupplier.length;
      ordersBySupplier.push({ supplier: supplierName, item, quantity, unit, cost: lineCost });
    } else {
      const row = ordersBySupplier[supplierIndex[key]];
      row.quantity += quantity;
      // Recompute cost later after aggregation if we want exact consolidations.
    }
  }

  shoppingList.forEach(({ item, quantity, unit }) => {
    let supplierName = "Other";
    for (const cat of Object.keys(suppliers)) {
      if (suppliers[cat] && suppliers[cat][item]) {
        supplierName = suppliers[cat][item];
        break;
      }
    }
    pushOrder(supplierName, item, quantity, unit, null);
  });

  // ---- OPTIONAL: Product Costing (from sku_prices.json) ----
  let productCostPreTax = 0;
  const perItemCost = {}; // item->cost (for possible use in UI later)

  function addCost(item, quantity, unit) {
    const items = sku?.items || {};
    const taxRate = sku?.tax_rate ?? 0.15;

    // Try exact match, then generic fallbacks for wine
    let price = items[item];
    if (!price && (item === "White Wine (750ml)" || item === "Red Wine (750ml)")) {
      price = items["Wine (750ml)"];
    }

    if (!price) return;

    let line = 0;

    // Special beer casing: "Beer (cans)" uses case pricing if provided
    if (item === "Beer (cans)" && (price.per_case && price.case_cost)) {
      const cansPerCase = Number(price.per_case || 24);
      const cases = Math.ceil(Number(quantity) / cansPerCase);
      line = cases * Number(price.case_cost || 0);
    } else {
      // Most entries: cost per unit (bottle/L/pcs/etc)
      // If SKU defines "unit_qty_oz", that's informational; we already converted to bottles/L/etc.
      line = Number(quantity) * Number(price.unit_cost || 0);
    }

    productCostPreTax += line;
    perItemCost[item] = (perItemCost[item] || 0) + line;

    return line;
  }

  // Compute costing per shopping row (optional; safe if sku missing)
  try {
    shoppingList.forEach(({ item, quantity, unit }) => {
      addCost(item, quantity, unit);
    });
  } catch (e) {
    // If sku_prices.json missing or malformed, skip costing gracefully
  }

  const productTax = (sku?.tax_rate ?? 0.15) * productCostPreTax;
  const productTotal = productCostPreTax + productTax;

  // ---- HTML blocks ----
  const costTableHTML = `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><th>Labor</th><th>Prep</th><th>Fees</th><th>Total (no product)</th></tr>
      <tr>
        <td>${toCurrency(laborCost)}</td>
        <td>${toCurrency(prepCost)}</td>
        <td>${toCurrency(fees)}</td>
        <td><strong>${toCurrency(laborCost + prepCost + fees)}</strong></td>
      </tr>
    </table>
  `;

  const productCostHTML = `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><th colspan="3" style="text-align:left;">Estimated Product Cost</th></tr>
      <tr><td>Subtotal</td><td>HST (${((sku?.tax_rate ?? 0.15)*100).toFixed(0)}%)</td><td><strong>Total</strong></td></tr>
      <tr>
        <td>${toCurrency(productCostPreTax)}</td>
        <td>${toCurrency(productTax)}</td>
        <td><strong>${toCurrency(productTotal)}</strong></td>
      </tr>
    </table>
  `;

  const shoppingListHTML = `
    <table border="1" cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f2f2f2;"><th>Item</th><th>Quantity</th><th>Unit</th></tr></thead>
      <tbody>
        ${shoppingList.map(i => `<tr><td>${i.item}</td><td>${i.quantity}</td><td>${i.unit}</td></tr>`).join("")}
      </tbody>
    </table>
  `;

  const ordersBySupplierHTML = `
    <table border="1" cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f2f2f2;"><th>Supplier</th><th>Item</th><th>Quantity</th><th>Unit</th></tr></thead>
      <tbody>
        ${ordersBySupplier.map(o => `<tr><td>${o.supplier}</td><td>${o.item}</td><td>${o.quantity}</td><td>${o.unit}</td></tr>`).join("")}
      </tbody>
    </table>
  `;

  // Not auto-sent to clients; LandingPage sends internal-only email.
  const clientEmail = `
Hi ${name},

Thank you for your inquiry — we’d be honoured to serve your event.

Based on your details:
• Guests: ${guests}
• Bar Type: ${barType}
• Cocktails: ${wantsCocktails && cocktails.length ? cocktails.join(", ") : "None"}

Here’s your quote (labor, prep & fees — product is estimated below):

${costTableHTML}

Estimated product budget:
${productCostHTML}

Cheers,
Two Sailors Bartending
  `.trim();

  return {
    // Data arrays
    shoppingList,
    ordersBySupplier,

    // Cost numbers (strings for EmailJS)
    laborCost: (laborCost).toFixed(2),
    prepCost: (prepCost).toFixed(2),
    fees: (fees).toFixed(2),
    totalCost: (laborCost + prepCost + fees).toFixed(2),

    // Product costing (optional, depends on sku_prices.json)
    productCostPreTax: productCostPreTax.toFixed(2),
    productTax: productTax.toFixed(2),
    productTotal: productTotal.toFixed(2),
    productCostHTML,

    // Helpful strings/blocks
    cocktails: Array.isArray(cocktails) ? cocktails.join(", ") : "",
    clientEmail,
    costTableHTML,
    shoppingListHTML,
    ordersBySupplierHTML,

    // Raw debug JSON
    quoteDetails: JSON.stringify({
      ...formData,
      crowdType // so you can see the derived profile
    }, null, 2)
  };
}
