import { Routes } from '@angular/router';
import { BookKeepingComponent } from './components/book-keeping/book-keeping.component';
import { HomeComponent } from './components/home/home.component';
import { FixedIncomeComponent } from './components/fixed-income/fixed-income.component';
import { FixedExpensesComponent } from './components/fixed-expenses/fixed-expenses.component';
import { IncomeComponent } from './components/income/income.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { TransfersComponent } from './components/transfers/transfers.component';

export const routes: Routes = [
  {path:'bookKeeping', component: BookKeepingComponent,
    children: [{
      path: 'fixedIncome', component: FixedIncomeComponent
    },{
      path: 'fixedExpenses', component: FixedExpensesComponent
    },{
      path: 'income', component: IncomeComponent
    },{
      path: 'expenses', component: ExpensesComponent
    },{
      path: 'transfers', component: TransfersComponent
    },{
      path: '', component: ExpensesComponent
    }]
   },
  {path:'home', component: HomeComponent},
  {path:'', component: HomeComponent},
  {path:'**', component: HomeComponent}
];
