import { ApiService } from './../../@services/api.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  imports: [],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss'
})
export class TestComponent {

  constructor(
    private apiService: ApiService
  ){}

  data = {
    "type":"飲食",
    "item":"吃烤羊排",
    "account":"a6221339@yahoo.com.tw"
  };
  account: string = "a6221339@yahoo.com.tw";
  data1 = {
    "balanceId": 1,
    "description": "測試",
    "type": "收入",
    "item": "（轉帳）轉入",
    "amount": 6000,
    "recurringPeriod": {
      "year": 0,
      "month": 0,
      "day": 0
    },
    "recordDate": "2025-06-13"
  };
  data2 = {
 "paymentId": 15,
 "description": "肚子餓",
 "type": "飲食",
 "item": "早餐",
 "amount": 55,
 "recurringPeriod":
 {
  "year": 0,
  "month": 0,
  "day": 0
 },
 "recordDate": "2025-06-09"
};
paymentId: number = 2;
data3 = {
  "account": "a6221339@yahoo.com.tw",
  "year": 2025,
  "month": 6
};
data4 = {
  "balanceId": 1,
  "name": "",
  "savings": 3000
};
data5 = {
  "account": "a6221339@yahoo.com.tw",
  "year": 2025,
  "month": 6
};
data6 = {
  "fromBalance": 1 ,
  "toBalance": 2,
  "amount": 23000,
  "description": "零用錢"
}
data7:{ account: string, id: number } = { account: 'a6221339@yahoo.com.tw', id: 1 };
data8:{ from: number, to: number } = { from: 3, to: 4 };
data9: number[] = [2];
data10 = {
  "familyId": 0,
  "account": "a6221339@yahoo.com.tw",
  "name": "我們這一家"
};
data11 = {
  "account": "a6221339@yahoo.com.tw",
  "password": "12345678"
};
data12 = {
  "name": "大型羊圈",
  "owner": "littlelambmero@gmail.com",
  "invitor": [
    "a6221339@yahoo.com.tw"
  ]
};
data13 = {
  "familyId": 1,
  "owner": "a6221339@yahoo.com.tw",
  "newName": "我們這一家開發測試"
};
data14 = {
 "familyId": 2,
 "owner": "a6221339@yahoo.com.tw",
 "memberAccount": "chihyun0110@gmail.com"
};

  createType(){
    this.apiService.createType(this.data)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('帳款類型建立成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('建立帳款類型失敗，請稍後再試');
      });
  }
  balanceId: number = 3;

  getTypeByAccount(){
    this.apiService.getTypeByAccount(this.account)
    .then(res => {
    const PaymentTypeList = res.data; // 這裡才是後端傳來的資料
    console.log('問卷列表：', PaymentTypeList);
    alert('取得帳款類型成功！');
  })
  .catch(err => {
    console.error('取得問卷失敗：', err);
    alert('取得帳款類型失敗！');
  });
  }

  createPayment(){
    this.apiService.createPayment(this.data1)
      .then(res => {
        console.log('成功送出：', res.data);
        alert('帳款建立成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('建立帳款失敗，請稍後再試');
      });
  }

  updatePayment(){
    this.apiService.updatePayment(this.data2)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('編輯帳款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('編輯帳款失敗，請稍後再試');
      });
  }

  deletePayment(){
    this.apiService.deletePayment(this.paymentId)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('刪除帳款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('刪除帳款失敗，請稍後再試');
      });
  }

  getPaymentByAccount(){
    this.apiService.getPaymentByAccount(this.account)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得帳款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得帳款失敗，請稍後再試');
      });
  }

  getBudgetByAccount(){
    this.apiService.getBudgetByAccount(this.data3)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得特定月預算成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得特定月預算失敗，請稍後再試');
      });
  }

  updateSavings(){
    this.apiService.updateSavings(this.data4)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('更新存款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('更新存款失敗，請稍後再試');
      });
  }

  getPaymentByAccountAndMonth(){
    this.apiService.getPaymentByAccountAndMonth(this.data5)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('取得帳款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('取得帳款失敗，請稍後再試');
      });
  }

  getBalanceByAccount(){
    this.apiService.getBalanceByAccount(this.account)
    .then(res => {
      const BalanceList = res.data; // 這裡才是後端傳來的資料
      console.log('帳戶列表：', BalanceList);
      alert('取得個人帳號帳戶成功！');
    })
    .catch(err => {
      console.error('取得帳戶失敗：', err);
      alert('取得個人帳號帳戶失敗！');
    });
  }

  createTransfers(){
    this.apiService.createTransfers(this.data6)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('創建轉帳紀錄成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('創建轉帳紀錄失敗，請稍後再試');
    });
  }

  deleteTransfers(){
    this.apiService.deleteTransfers(this.data7.account, this.data7.id)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('管理員刪除轉帳紀錄成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('管理員刪除轉帳紀錄失敗，請稍後再試');
    });
  }

  deleteUselessTransfers(){
    this.apiService.deleteUselessTransfers(this.data8.from, this.data8.to)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('刪除無用轉帳紀錄成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('刪除無用轉帳紀錄失敗，請稍後再試');
    });
  }

  getAllTransfersByBalanceId(){
    this.apiService.getAllTransfersByBalanceId(this.balanceId)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得帳戶所有轉帳款項成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得帳戶所有轉帳款項失敗，請稍後再試');
    });
  }

  getSavingsByAccount(){
    this.apiService.getSavingsByAccount(this.account)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('獲取帳號所有帳戶儲蓄成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲取帳號所有帳戶儲蓄失敗，請稍後再試');
    });
  }

  getPaymentInPendingDeletion(){
    this.apiService.getPaymentInPendingDeletion(this.account)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得待刪區帳款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得待刪區帳款失敗，請稍後再試');
    });
  }

  recoveryPayments(){
    this.apiService.recoveryPayments(this.data9)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('復原帳款成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('復原帳款失敗，請稍後再試');
    });
  }

  createBalance(){
    this.apiService.createBalance(this.data10)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('創建帳戶成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('創建帳戶失敗，請稍後再試');
    });
  }

  deleteBalance(){
    this.apiService.deleteBalance(this.balanceId)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('刪除帳戶成功！');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('刪除帳戶失敗，請稍後再試');
    });
  }

  getFamilyByAccount(){
    this.apiService.getFamilyByAccount(this.account)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得已加入家庭列表成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得已加入家庭列表失敗，請稍後再試');
    });
  }

  login(){
    this.apiService.login(this.data11)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('會員登入成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('會員登入失敗，請稍後再試');
    });
  }

  getNameByAccount(){
    this.apiService.getNameByAccount(this.account)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得帳號名稱成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得帳號名稱失敗，請稍後再試');
    });
  }

  createFamily(){
    this.apiService.createFamily(this.data12)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('創建家庭成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('創建家庭失敗，請稍後再試');
    });
  }

  renameFamily(){
    this.apiService.renameFamily(this.data13)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('家庭改名成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('家庭改名失敗，請稍後再試');
    });
  }

  removeFamilyMember(){
    this.apiService.removeFamilyMember(this.data14)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('踢出家庭成員成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('踢出家庭成員失敗，請稍後再試');
    });
  }

}
