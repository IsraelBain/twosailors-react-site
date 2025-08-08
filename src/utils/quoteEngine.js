import pricing from "../config/pricing.json";
import consumption from "../config/consumption.json";
import suppliers from "../config/suppliers.json";
import yields from "../config/yields.json";
import recipes from "../config/recipes.json";

export default function quoteEngine(formData) {
  const {
    name,
    email,
    date,
    occasion,
    barServiceHours = 6,
    liquorProvider,
    guests,
    location,
    budget,
    barType,
    spirits = "",
    beerWine = "",
    cupPreference,
    specialRequests = "",
    referralSource,
    cocktails = [],
    drinksPerGuest = 3,
    crowdType = "standard_lean_beer",
    km = 0
  } = formData;

  const rate =
    barType === "Open Bar" ? pricing.open_bar_rate : pricing.cash_bar_rate;
  const prepHours =
    barType === "Open Bar"
      ? pricing.prep.default_hours.open_bar
      : pricing.prep.default_hours.cash_bar;

  // 1️⃣ Labor & Prep
  const laborHours =
    Number(barServiceHours) +
    pricing.setup_teardown_hours_per_bartender.before +
    pricing.setup_teardown_hours_per_bartender.after;

  const laborCost = rate * laborHours;
  const prepCost =
    pricing.prep.rate_per_hour * Math.min(prepHours, pricing.prep.max_hours);

  // Initialize product list
  let productList = {};

  // 2️⃣ Product Calculation (Only for Open Bar)
  if (barType === "Open Bar") {
    const split = consumption.presets[crowdType];
    const totalDrinks = guests * drinksPerGuest * (1 + consumption.buffer);

    const cocktailCount = Math.round(totalDrinks * split.cocktails);
    const beerCount = Math.round(totalDrinks * split.beer);
    const wineCount = Math.round(totalDrinks * split.wine);

    // Beer & Wine quantities
    productList["Beer (cans)"] = beerCount;
    productList["Wine (750ml bottles)"] = Math.ceil(
      wineCount / yields.wine_750ml_glasses_5oz
    );

    // Cocktails
    const cocktailsPerRecipe = cocktailCount / cocktails.length;

    cocktails.forEach((cocktailName) => {
      const recipe = recipes[cocktailName];
      if (!recipe) return;

      for (let [ingredient, details] of Object.entries(recipe.ingredients)) {
        const totalQty = details.qty * cocktailsPerRecipe;
        const key = `${ingredient} (${details.unit})`;
        productList[key] = (productList[key] || 0) + totalQty;
      }
    });
  }

  // 3️⃣ Group Orders by Supplier
  let ordersBySupplier = {};
  for (let item in productList) {
    let supplierName = "Other";
    for (let category in suppliers) {
      if (suppliers[category][item]) {
        supplierName = suppliers[category][item];
        break;
      }
    }
    if (!ordersBySupplier[supplierName]) ordersBySupplier[supplierName] = [];
    ordersBySupplier[supplierName].push({
      item,
      qty: parseFloat(productList[item].toFixed(2))
    });
  }

  // 4️⃣ Fees & Total
  const fees =
    pricing.booking_fee +
    pricing.insurance_fee +
    pricing.travel_rate_per_km * km;

  const totalCost = laborCost + prepCost + fees;

  // 5️⃣ Client Email Draft
  const clientEmail = `
Hi ${name},

Thank you for using our website! We would be honoured to work your event.

Based on your request:
- Guests: ${guests}
- Bar Type: ${barType}
- Cocktails: ${cocktails.join(", ") || "N/A"}

Here is a high-level breakdown:

Labor: $${laborCost.toFixed(2)}
Prep: $${prepCost.toFixed(2)}
Fees: $${fees.toFixed(2)}

Estimated Product List:
${Object.entries(productList)
  .map(([item, qty]) => `- ${item}: ${qty}`)
  .join("\n")}

We would be happy to take a call to discuss your menu, service, and any custom touches.

Menu & Pricing: https://twosailorsbartending.ca/menu

Best,
Two Sailors Bartending
  `;

  // ✅ Final 4 outputs
  return {
    shoppingList: productList,
    ordersBySupplier,
    costBreakdown: { laborCost, prepCost, fees, totalCost },
    clientEmail,

    // Pass everything for EmailJS template use
    emailVars: {
      name,
      email,
      date,
      occasion,
      barServiceHours,
      liquorProvider,
      guests,
      location,
      budget,
      barType,
      spirits,
      beerWine,
      cupPreference,
      specialRequests,
      referralSource,
      laborCost: laborCost.toFixed(2),
      prepCost: prepCost.toFixed(2),
      fees: fees.toFixed(2),
      totalCost: totalCost.toFixed(2),
      shoppingList: JSON.stringify(productList, null, 2),
      ordersBySupplier: JSON.stringify(ordersBySupplier, null, 2)
    }
  };
}
