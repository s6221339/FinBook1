import { Routes } from '@angular/router';
import { BookKeepingComponent } from './components/book-keeping/book-keeping.component';
import { HomeComponent } from './components/home/home.component';
import { FixedIncomeComponent } from './components/fixed-income/fixed-income.component';
import { FixedExpensesComponent } from './components/fixed-expenses/fixed-expenses.component';
import { IncomeComponent } from './components/income/income.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { TransfersComponent } from './components/transfers/transfers.component';
import { TestComponent } from './components/test/test.component';
import { CreateItemComponent } from './components/create-item/create-item.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LedgerComponent } from './components/ledger/ledger.component';
import { TransferHistoryComponent } from './components/transfer-history/transfer-history.component';
import { ModifyPaymentComponent } from './components/modify-payment/modify-payment.component';
import { EditPaymentComponent } from './components/edit-payment/edit-payment.component';
import { PendingDeletionComponent } from './components/pending-deletion/pending-deletion.component';
import { MyBalanceComponent } from './components/my-balance/my-balance.component';
import { MyFamilyComponent } from './components/my-family/my-family.component';
import { MemberCenterComponent } from './components/member-center/member-center.component';
import { MemberInfoComponent } from './components/member-info/member-info.component';
import { MemberConfirmComponent } from './components/member-confirm/member-confirm.component';
import { ChangePasswordsComponent } from './components/change-passwords/change-passwords.component';
import { ForgetPasswordsComponent } from './components/forget-passwords/forget-passwords.component';
import { CreateFamilyComponent } from './components/create-family/create-family.component';
import { FamilyManagementComponent } from './components/family-management/family-management.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ExpenseByCategoryComponent } from './components/expense-by-category/expense-by-category.component';
import { ExpenseByAccountComponent } from './components/expense-by-account/expense-by-account.component';
import { IncomeByCategoryComponent } from './components/income-by-category/income-by-category.component';
import { IncomeByAccountComponent } from './components/income-by-account/income-by-account.component';
import { IncomeExpenseTrendChartComponent } from './components/income-expense-trend-chart/income-expense-trend-chart.component';
import { UnacceptedFamilyInvitationComponent } from './components/unaccepted-family-invitation/unaccepted-family-invitation.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { AuthGuard } from './@guards/auth.guard';
import { AdminGuard } from './@guards/admin.guard';

export const routes: Routes = [
  { path:'bookKeeping', component: BookKeepingComponent, canActivate: [AuthGuard],
    children: [
      { path: 'fixedIncome', component: FixedIncomeComponent },
      { path: 'fixedExpenses', component: FixedExpensesComponent },
      { path: 'income', component: IncomeComponent },
      { path: 'expenses', component: ExpensesComponent },
      { path: 'transfers', component: TransfersComponent },
      { path: '', component: ExpensesComponent }]},
  { path: 'transfersHistory', component: TransferHistoryComponent },
  { path: 'test', component: TestComponent, canActivate: [AdminGuard] },
  { path: 'createItem', component: CreateItemComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'ledger', component: LedgerComponent, canActivate: [AuthGuard] },
  { path: 'modifyPayment', component: ModifyPaymentComponent, canActivate: [AuthGuard] },
  { path: 'editPayment', component: EditPaymentComponent, canActivate: [AuthGuard] },
  { path: 'pendingDeletion', component: PendingDeletionComponent, canActivate: [AuthGuard] },
  { path: 'myBalance', component: MyBalanceComponent, canActivate: [AuthGuard] },
  { path: 'myFamily', component: MyFamilyComponent },
  { path:'memberCenter', component: MemberCenterComponent, canActivate: [AuthGuard],
    children: [
      { path: 'memberInfo', component: MemberInfoComponent },
      { path: 'memberConfirm', component: MemberConfirmComponent },
      { path: 'changePasswords', component:ChangePasswordsComponent },
      { path: '', redirectTo: 'memberConfirm', pathMatch: 'full' }]},
  { path:'forget',component: ForgetPasswordsComponent },
  { path:'createFamily',component: CreateFamilyComponent },
  { path:'familyManagement',component: FamilyManagementComponent },
  { path:'statistics',component: StatisticsComponent,
    children: [
      { path: 'incomeExpenseTrendChart', component: IncomeExpenseTrendChartComponent },
      { path: 'expenseByCategory', component: ExpenseByCategoryComponent },
      { path: 'expenseByAccount', component: ExpenseByAccountComponent },
      { path: 'incomeByCategory', component: IncomeByCategoryComponent },
      { path: 'incomeByAccount', component: IncomeByAccountComponent },
    ]
  },
  { path:'unacceptedFamilyInvitation',component: UnacceptedFamilyInvitationComponent },
  { path:'unauthorized',component: UnauthorizedComponent },
  { path: 'home', component: HomeComponent },
  { path: '', component: HomeComponent },
  { path: '**', component: HomeComponent }
];
