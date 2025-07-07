import { registerChartJS } from './app/@configs/chart.config';
registerChartJS();  // ✅ 呼叫一次，註冊 Chart.js 所需元件
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
