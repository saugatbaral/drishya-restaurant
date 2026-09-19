/**
 * Menu content for Drishya Restaurant.
 *
 * This is the only file you need to edit to change the menu.
 * Add an item to a category's `items` list:
 *
 *   { name: "Masala tea", description: "Milk tea with spices.", price: "Rs 60" }
 *
 * - `description` and `price` are optional.
 * - A category with no items shows a "menu is being updated" message.
 * - To add a new category, copy one block and give it a unique `id`.
 */
export const categories = [
  {
    id: "food",
    label: "Food",
    items: [],
  },
  {
    id: "drinks",
    label: "Drinks",
    items: [
      { name: "Tea", description: "A warm drink to enjoy with the cool air." },
      { name: "Coffee", description: "Perfect for a peaceful moment." },
    ],
  },
  {
    id: "snacks",
    label: "Snacks",
    items: [],
  },
];
