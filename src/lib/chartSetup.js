import {
  Chart as ChartJS,
  BarElement,
  BarController,
  ArcElement,
  PieController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  BarController,
  ArcElement,
  PieController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

ChartJS.defaults.color = "#8b95b2";

export const GRID_COLOR = "#242c44";
export const TICK = { font: { size: 11 } };

/* Shows a pointer cursor over clickable bar/segment charts — pass as
   options.onHover for any chart wired up with a click-through handler. */
export function cursorPointerOnHover(event, elements) {
  if (event.native?.target) event.native.target.style.cursor = elements.length ? "pointer" : "default";
}

/* Canvas can't read CSS custom properties, so resolve the next/font-generated
   family name from the DOM once the dashboard root has mounted. */
export function syncChartFontFamily(rootEl) {
  const family = getComputedStyle(rootEl).getPropertyValue("--font-inter").trim();
  if (family) ChartJS.defaults.font.family = `${family}, sans-serif`;
}

export default ChartJS;
