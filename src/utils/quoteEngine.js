// utils/quoteEngine.js — v2.4.1
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
  "Coke": 0.30, "Diet Coke": 0.10, "Ginger Ale": 0.20,
  "Sprite": 0.15, "Soda Water": 0.15, "Tonic Water": 0.10
};
const wineSplit = pricing?.wine_split || { white: 0.6, red: 0.4 };
// Portion of mixed drinks that become specialty cocktails when cocktails=Yes
const specialtyCocktailFraction = typeof pricing?.specialty_cocktail_fraction === "number"
  ? pricing.specialty_cocktail_fraction
  : 0.4;

// Per-drink volumes (adjustable)
const OZ_PER_HIGHBALL_SPIRIT = pricing?.oz_per_highball_spirit || 1.5;
const OZ_PER_HIGHBALL_MIXER  = pricing?.oz_per_highball_mixer  || 4.0;

const isAlcoholCategory = (cat) => ["spirits", "wine", "beer", "cider"].includes(cat);

// Try to resolve a catalog category for an item using suppliers.json + heuristics
function getCategoryForItem(item) {
  // Exact lookup in suppliers.json
  for (const cat of Object.keys(suppliers)) {
    if (suppliers[cat] && suppliers[cat][item]) return cat;
  }
  // Heuristics
  const i = item.toLowerCase();
  if (i.includes("wine")) return "wine";
  if (i.startsWith("beer")) return "beer";
  if (/(vodka|rum|gin|tequila|rye|whisk|bourbon|aperol|triple sec|coffee liqueur|prosecco)/i.test(item)) return "spirits";
  if (/(juice|soda|tonic|cola|ginger ale|sprite|ginger beer)/i.test(item)) return "mixers";
  if (/syrup/i.test(item)) return "syrups";
  if (/(mint|raspber|orange|lemon|lime|peel|wedge|wheel)/i.test(item)) return "garnish";
  if (/(ice|egg)/i.test(item)) return "other";
  return "other";
}

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

  // ---- Labor / Fees (split out) ----
  const bartenderCount = Math.max(1, Math.ceil(num(guests) / 60));
  const serviceHoursNum = num(barServiceHours, pricing.minimum_hours || 3);
  const totalLaborHours = serviceHoursNum + 2; // +1 setup +1 teardown
  const baseRate = (barType === "Open Bar")
    ? num(pricing.open_bar_rate, 75)
    : num(pricing.cash_bar_rate, 60);
  const laborCost = baseRate * bartenderCount * totalLaborHours;

  const prepCfg = pricing?.prep || {
    enabled: true,
    rate_per_hour: 30,
    default_hours: { cash_bar: 2, open_bar: 3 },
    max_hours: 3
  };
  const prepHours = Math.min(
    barType === "Open Bar" ? num(prepCfg.default_hours?.open_bar, 3) : num(prepCfg.default_hours?.cash_bar, 2),
    num(prepCfg.max_hours, 3)
  );
  const prepCost = prepCfg.enabled ? (num(prepCfg.rate_per_hour, 30) * prepHours) : 0;

  const bookingFee   = num(pricing.booking_fee, 200);
  const insuranceFee = num(pricing.insurance_fee, 200);
  const travelFee    = num(pricing.travel_rate_per_km) * num(km);

  const fees = bookingFee + insuranceFee + travelFee; // kept for backward-compat
  const nonProductSubtotal = laborCost + prepCost + fees;

  // ---- Product Math (Unified for Open/Cash) ----
  const need = {}; // normalized: "Vodka (oz)", "Coke (oz)", "Ice (lbs)", "Red Wine (750ml) (bottle)"

  if (guests > 0) {
    const split = consumption.presets[crowdType] || consumption.presets.wedding_40_35_25;
    const totalDrinks = guests * drinksPerGuest * (1 + (consumption.buffer || 0));
    const mixedDrinks = Math.round(totalDrinks * (split.cocktails || 0));
    const beerDrinks  = Math.round(totalDrinks * (split.beer || 0));
    const wineGlasses = Math.round(totalDrinks * (split.wine || 0));

    const cocktailCount = wantsCocktails ? Math.round(mixedDrinks * specialtyCocktailFraction) : 0;
    const highballCount = mixedDrinks - cocktailCount;

    // Wine (split white/red)
    const wineBottlesTotal = Math.ceil(wineGlasses / (yields.wine?.["750ml_glasses_5oz"] || 5));
    const whiteBottles = Math.max(0, Math.round(wineBottlesTotal * (wineSplit.white || 0.6)));
    const redBottles   = Math.max(0, wineBottlesTotal - whiteBottles);
    if (whiteBottles > 0) sumObj(need, "White Wine (750ml) (bottle)", whiteBottles);
    if (redBottles   > 0) sumObj(need, "Red Wine (750ml) (bottle)",   redBottles);

    // Beer
    if (beerDrinks > 0) sumObj(need, "Beer (cans) (can)", beerDrinks);

    // Highballs: spirits + mixers
    if (highballCount > 0) {
      const totalSpiritOz = OZ_PER_HIGHBALL_SPIRIT * highballCount;
      Object.keys(railSplit).forEach(sp => {
        const oz = totalSpiritOz * (railSplit[sp] || 0);
        if (oz > 0) sumObj(need, `${sp} (oz)`, oz);
      });

      const totalMixerOz = OZ_PER_HIGHBALL_MIXER * highballCount;
      Object.keys(mixerSplit).forEach(mx => {
        const oz = totalMixerOz * (mixerSplit[mx] || 0);
        if (oz > 0) sumObj(need, `${mx} (oz)`, oz);
      });
    }

    // Specialty cocktails
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

    // Ice
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

    if (base === "White Wine (750ml)" || base === "Red Wine (750ml)") {
      shoppingList.push({ item: base, quantity: ceil(qty), unit: "bottle" });
      return;
    }
    if (base === "Beer (cans)") {
      shoppingList.push({ item: base, quantity: ceil(qty), unit: "can" });
      return;
    }
    if (base === "Ice") {
      shoppingList.push({ item: base, quantity: ceil(qty), unit: "lbs" });
      return;
    }

    // Spirits -> bottles
    if (unit === "oz" && (spirits114.has(base) || spirits750.has(base))) {
      const bottleOz = spirits114.has(base) ? one14oz : seven50oz;
      shoppingList.push({ item: base, quantity: ceil(qty / bottleOz), unit: "bottle" });
      return;
    }
    // Mixers (oz -> L)
    if (unit === "oz" && (suppliers.mixers && suppliers.mixers[base])) {
      shoppingList.push({ item: base, quantity: ceil(qty / literOz), unit: "L" });
      return;
    }
    // Syrups (oz -> 1L bottle)
    if (unit === "oz" && (suppliers.syrups && suppliers.syrups[base])) {
      shoppingList.push({ item: base, quantity: ceil(qty / syrup1LBottleOz), unit: "1L bottle" });
      return;
    }

    // Garnish conversions
    if (unit === "each") {
      if (base === "Lime Wedge") {
        const per = yields.garnish?.lime_wedges_per_lime || 8;
        shoppingList.push({ item: "Limes", quantity: ceil(qty / per), unit: "pcs" });
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
      shoppingList.push({ item: base, quantity: ceil(qty), unit: "each" });
      return;
    }

    // Dashes (bitters etc.) -> 1 bottle
    if (unit === "dash") {
      shoppingList.push({ item: base, quantity: 1, unit: "bottle" });
      return;
    }

    // Fallback
    shoppingList.push({ item: base, quantity: ceil(qty), unit });
  });

  // ---- Orders by Supplier ----
  const ordersBySupplier = [];
  const supplierIndex = {};
  function pushOrder(supplierName, item, quantity, unit) {
    const key = `${supplierName}__${item}__${unit}`;
    if (!(key in supplierIndex)) {
      supplierIndex[key] = ordersBySupplier.length;
      ordersBySupplier.push({ supplier: supplierName, item, quantity, unit });
    } else {
      ordersBySupplier[supplierIndex[key]].quantity += quantity;
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
    pushOrder(supplierName, item, quantity, unit);
  });

  // ---- Product Costing (split: Alcohol vs Non-Alcohol) ----
  let productAlcoholPreTax = 0;
  let productNonAlcoholPreTax = 0;
  let productCostPreTax = 0;

  const itemsCatalog = sku?.items || {};
  const taxRate = sku?.tax_rate ?? 0.15;

  function addCost(item, quantity) {
    // Exact match (fallback wine generic)
    let price = itemsCatalog[item];
    if (!price && (item === "White Wine (750ml)" || item === "Red Wine (750ml)")) {
      price = itemsCatalog["Wine (750ml)"];
    }
    if (!price) return; // silently skip if no price

    let line = 0;
    if (item === "Beer (cans)" && (price.per_case && price.case_cost)) {
      const cansPerCase = Number(price.per_case || 24);
      const cases = Math.ceil(Number(quantity) / cansPerCase);
      line = cases * Number(price.case_cost || 0);
    } else {
      line = Number(quantity) * Number(price.unit_cost || 0);
    }

    productCostPreTax += line;
    const cat = getCategoryForItem(item);
    if (isAlcoholCategory(cat)) productAlcoholPreTax += line;
    else productNonAlcoholPreTax += line;
  }

  try {
    shoppingList.forEach(({ item, quantity }) => addCost(item, quantity));
  } catch (e) {
    // swallow pricing errors
  }

  const productTax   = taxRate * productCostPreTax;
  const productTotal = productCostPreTax + productTax;
  const grandTotal   = nonProductSubtotal + productTotal;

  // ---- HTML blocks ----
  const costBreakdownHTML = `
    <table border="0" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;">
      <tr><td colspan="2" style="font-size:18px;font-weight:bold;padding-top:10px;">Service Costs</td></tr>
      <tr><td>Labor (${bartenderCount} bartender(s) × ${toCurrency(baseRate)}/hr × ${totalLaborHours} hrs)</td><td style="text-align:right;">${toCurrency(laborCost)}</td></tr>
      <tr><td>Prep (${prepHours} hr${prepHours===1?"":"s"} @ ${toCurrency(prepCfg.rate_per_hour||30)}/hr)</td><td style="text-align:right;">${toCurrency(prepCost)}</td></tr>
      <tr><td>Booking Fee</td><td style="text-align:right;">${toCurrency(bookingFee)}</td></tr>
      <tr><td>Insurance</td><td style="text-align:right;">${toCurrency(insuranceFee)}</td></tr>
      <tr><td>Travel (${num(km)} km @ ${toCurrency(num(pricing.travel_rate_per_km))}/km)</td><td style="text-align:right;">${toCurrency(travelFee)}</td></tr>
      <tr><td style="border-top:1px solid #ddd;"><strong>Service Subtotal</strong></td><td style="text-align:right;border-top:1px solid #ddd;"><strong>${toCurrency(nonProductSubtotal)}</strong></td></tr>

      <tr><td colspan="2" style="font-size:18px;font-weight:bold;padding-top:18px;">Product Costs (Estimated)</td></tr>
      <tr><td>Alcohol (beer, wine, spirits)</td><td style="text-align:right;">${toCurrency(productAlcoholPreTax)}</td></tr>
      <tr><td>Non-Alcohol (mixers, syrups, garnish, ice)</td><td style="text-align:right;">${toCurrency(productNonAlcoholPreTax)}</td></tr>
      <tr><td>Products Subtotal (pre-tax)</td><td style="text-align:right;">${toCurrency(productCostPreTax)}</td></tr>
      <tr><td>HST (${(taxRate*100).toFixed(0)}%) on products</td><td style="text-align:right;">${toCurrency(productTax)}</td></tr>
      <tr><td style="border-top:1px solid #ddd;"><strong>Products Total</strong></td><td style="text-align:right;border-top:1px solid #ddd;"><strong>${toCurrency(productTotal)}</strong></td></tr>

      <tr><td colspan="2" style="padding-top:18px;border-top:2px solid #000;"><strong>Grand Total (Service + Products)</strong><span style="color:#666;font-weight:normal;"> — estimate</span>
      </td></tr>
      <tr><td></td><td style="text-align:right;font-size:18px;"><strong>${toCurrency(grandTotal)}</strong></td></tr>
    </table>
    <div style="font-size:12px;color:#666;margin-top:8px;">
      *Product costs are estimates based on current list pricing; final totals may vary with brand availability and store pricing.
    </div>
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
      <thead><tr style="background:#f2f2f2;"><th>Item</th><th>Qty</th><th>Unit</th></tr></thead>
      <tbody>
        ${shoppingList.map(i => `<tr><td>${i.item}</td><td>${i.quantity}</td><td>${i.unit}</td></tr>`).join("")}
      </tbody>
    </table>
  `;

  const ordersBySupplierHTML = `
    <table border="1" cellpadding="6" cellspacing="0" style="width:100%;border-collapse:collapse;">
      <thead><tr style="background:#f2f2f2;"><th>Supplier</th><th>Item</th><th>Qty</th><th>Unit</th></tr></thead>
      <tbody>
        ${ordersBySupplier.map(o => `<tr><td>${o.supplier}</td><td>${o.item}</td><td>${o.quantity}</td><td>${o.unit}</td></tr>`).join("")}
      </tbody>
    </table>
  `;

  // Client-facing friendly block you can copy/paste
  const clientQuoteHTML = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;">
      <p>Hi ${name || "there"},</p>
      <p>Thanks so much for reaching out and for sending your event details — we’d love to look after bartending for your ${occasion || "event"} on ${date || "(date TBC)"} in ${location || "your venue"}.</p>

      <p>Based on <strong>${guests}</strong> guests and an <strong>${barType}</strong> setup${wantsCocktails ? " with cocktails" : ""}, here’s a preliminary estimate:</p>

      ${costBreakdownHTML}

      <p style="margin-top:16px;">If this looks good, reply here and we’ll lock in your date and finalize the bar menu and staffing plan. If you’d like us to tailor the cocktail list or adjust the beer/wine mix, just say the word!</p>

      <p>Cheers,<br/>Two Sailors Bartending</p>
    </div>
  `.trim();

  // Back-compat minimal cost table used earlier
  const costTableHTML = `
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
      <tr><th>Labor</th><th>Prep</th><th>Fees</th><th>Total (no product)</th></tr>
      <tr>
        <td>${toCurrency(laborCost)}</td>
        <td>${toCurrency(prepCost)}</td>
        <td>${toCurrency(fees)}</td>
        <td><strong>${toCurrency(nonProductSubtotal)}</strong></td>
      </tr>
    </table>
  `;

  // Optional plain-text email body (kept if you ever need it)
  const clientEmail = `
Hi ${name},

Thank you for your inquiry — we’d be honoured to serve your event.

Guests: ${guests}
Bar Type: ${barType}
Cocktails: ${wantsCocktails && cocktails.length ? cocktails.join(", ") : "None"}

I've attached an itemized estimate below.

Cheers,
Two Sailors Bartending
  `.trim();

  return {
    // Data arrays
    shoppingList,
    ordersBySupplier,

    // Service cost lines
    laborCost: (laborCost).toFixed(2),
    prepCost: (prepCost).toFixed(2),
    bookingFee: bookingFee.toFixed(2),
    insuranceFee: insuranceFee.toFixed(2),
    travelFee: travelFee.toFixed(2),
    fees: (fees).toFixed(2), // legacy combined
    nonProductSubtotal: nonProductSubtotal.toFixed(2),

    // Product costing split
    productAlcoholPreTax: productAlcoholPreTax.toFixed(2),
    productNonAlcoholPreTax: productNonAlcoholPreTax.toFixed(2),
    productCostPreTax: productCostPreTax.toFixed(2),
    productTax: productTax.toFixed(2),
    productTotal: productTotal.toFixed(2),

    // Grand total
    grandTotal: grandTotal.toFixed(2),

    // HTML blocks
    costBreakdownHTML,
    productCostHTML,
    costTableHTML, // legacy
    shoppingListHTML,
    ordersBySupplierHTML,
    clientQuoteHTML,

    // Helpful strings
    cocktails: Array.isArray(cocktails) ? cocktails.join(", ") : "",
    clientEmail,

    // Raw debug JSON
    quoteDetails: JSON.stringify({
      ...formData,
      derived: { crowdType, bartenderCount, totalLaborHours, baseRate }
    }, null, 2)
  };
}
