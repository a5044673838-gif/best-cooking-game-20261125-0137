// Sizzle & Serve — configuration: canvas, kitchen layout, recipes, tuning.
// All original. No assets, no network: every sprite is drawn in render.js.
const VIEW = { w: 1280, h: 720 };
const HUD_H = 76;

const COLORS = {
  floorA: '#e8c99a',
  floorB: '#dfbd86',
  wall: '#f7ead2',
  wallTrim: '#c98f4e',
  counterTop: '#b5773a',
  counterSide: '#8a5426',
  counterEdge: '#6e3f1c',
  steel: '#c9ced6',
  steelDark: '#9aa1ad',
  board: '#e9d8a6',
  ink: '#2b2118',
  cream: '#fff6e3',
  ticket: '#fffdf5',
  red: '#d64541',
  green: '#3f9e4d',
  gold: '#e9a13b',
  blue: '#3a7bd5',
};

const CHEF = { r: 26, speed: 265 };

// Ingredient catalogue. chop: needs the board. cook: needs a burner.
// plate: true means it can go straight onto a plate.
const INGREDIENTS = {
  bun: { name: 'Bun', price: 0, chop: false, cook: false, color: '#e8a54b' },
  patty_raw: { name: 'Raw Patty', price: 0, chop: false, cook: true, color: '#b06a5a' },
  patty: { name: 'Patty', price: 0, chop: false, cook: false, color: '#7a4a2b' },
  patty_burnt: { name: 'Burnt Patty', price: 0, chop: false, cook: false, color: '#2e211a' },
  lettuce: { name: 'Lettuce', price: 0, chop: true, cook: false, color: '#69b455' },
  lettuce_chopped: { name: 'Lettuce', price: 0, chop: false, cook: false, color: '#7cc96a' },
  tomato: { name: 'Tomato', price: 0, chop: true, cook: false, color: '#e04b3a' },
  tomato_chopped: { name: 'Tomato', price: 0, chop: false, cook: false, color: '#ef6a55' },
  cheese: { name: 'Cheese', price: 0, chop: false, cook: false, color: '#f2c230' },
  onion: { name: 'Onion', price: 0, chop: true, cook: false, color: '#b678c9' },
  onion_chopped: { name: 'Onion', price: 0, chop: false, cook: false, color: '#c98fdb' },
};

const CHOP_TIME = 1.4; // seconds of chopping
const COOK_TIME = 6; // raw -> cooked
const BURN_TIME = 11; // cooked -> burnt (5s grace after cooked)

// Recipes: the order board's menu. needs lists ingredient ids on the plate.
const RECIPES = [
  { id: 'classic', name: 'Classic Burger', needs: ['bun', 'patty', 'lettuce_chopped', 'tomato_chopped'], price: 12 },
  { id: 'cheese', name: 'Cheese Burger', needs: ['bun', 'patty', 'cheese', 'lettuce_chopped'], price: 14 },
  { id: 'salad', name: 'Garden Salad', needs: ['lettuce_chopped', 'tomato_chopped', 'onion_chopped'], price: 10 },
  { id: 'double', name: 'Double Stack', needs: ['bun', 'patty', 'patty', 'cheese'], price: 18 },
  { id: 'veggie', name: 'Veggie Stack', needs: ['bun', 'lettuce_chopped', 'tomato_chopped', 'onion_chopped', 'cheese'], price: 16 },
];

// Kitchen stations. x,y are the interaction anchor; w,h the drawn counter.
const STATIONS = {
  bins: [
    { id: 'bin-bun', item: 'bun', x: 90, y: 132, w: 120, h: 76, label: 'Buns' },
    { id: 'bin-patty', item: 'patty_raw', x: 220, y: 132, w: 120, h: 76, label: 'Patties' },
    { id: 'bin-lettuce', item: 'lettuce', x: 350, y: 132, w: 120, h: 76, label: 'Lettuce' },
    { id: 'bin-tomato', item: 'tomato', x: 480, y: 132, w: 120, h: 76, label: 'Tomato' },
    { id: 'bin-cheese', item: 'cheese', x: 610, y: 132, w: 120, h: 76, label: 'Cheese' },
    { id: 'bin-onion', item: 'onion', x: 740, y: 132, w: 120, h: 76, label: 'Onion' },
  ],
  board: { id: 'board', x: 150, y: 300, w: 220, h: 120, label: 'Chopping Board' },
  stove: { id: 'stove', x: 1090, y: 300, w: 220, h: 120, label: 'Stove' },
  plating: { id: 'plating', x: 640, y: 440, w: 360, h: 110, label: 'Plating Counter' },
  window: { id: 'window', x: 1090, y: 590, w: 220, h: 120, label: 'Serving Window' },
  trash: { id: 'trash', x: 150, y: 590, w: 160, h: 110, label: 'Trash' },
  plates: { id: 'plates', x: 430, y: 440, w: 110, h: 110, label: 'Plates' },
};

const DAY_LENGTH = 150; // seconds
const ORDER_PATIENCE = 50; // seconds before an order expires
const ORDER_FIRST_DELAY = 4;
const ORDER_INTERVAL = 13; // shrinks as the day goes on
const MAX_ORDERS = 4;
const START_HEARTS = 3;
const INTERACT_R = 96; // how close the chef must be to use a station
