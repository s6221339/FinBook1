import {
  Chart,
  LinearScale,
  CategoryScale,
  BarElement,
  LineElement,
  PointElement,
  Legend,
  Tooltip,
  BarController,
  LineController
} from 'chart.js';

/** 一次性註冊 Chart.js 所需元件 */
export function registerChartJS(): void {
  Chart.register(
    //  元件
    LinearScale,
    CategoryScale,
    BarElement,
    LineElement,
    PointElement,
    //  控制器
    BarController,
    LineController,
    //  插件
    Legend,
    Tooltip
  );
}
