import {ChangeDetectionStrategy, Component} from '@angular/core';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Category } from '../../models/categories';

@Component({
  selector: 'app-expenses',
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, MatIconModule,MatFormFieldModule,
    MatSelectModule],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {
  //  新增 today 變數，預設為今天日期
  today: Date = new Date();
  userNames: string[] = ["帳戶1", "帳戶2", "帳戶3"];
  selectedUserName: string = this.userNames[0]; //  預設帳戶1;
  type?: string;
  item?: string;
  categories: Category[] = [{type: "交通", item: "停車費"}, {type: "其他", item: "交際應酬"}, {type: "娛樂", item: "KTV"}];

}
