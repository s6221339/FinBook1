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
 "memberAccount": ["chihyun0110@gmail.com"]
};
data15 = {
 "familyId": "3",
 "owner": "a6221339@yahoo.com.tw",
 "invitor": [
     "a6221339@yahoo.com.tw"
 ]
}
data16 = {
  "familyId": "2",
  "oldOwner": "chihyun0110@gmail.com",
  "newOwner": "a6221339@yahoo.com.tw"
}
data17 = {
  "familyId": 6,
  "owner": "a6221339@yahoo.com.tw"
}
data18 = {
 "familyId": 6,
 "memberAccount": "littlelambmero@gmail.com"
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
  familyId: number = 1;
  data19: { familyId: number, owner: string, invitee: string} = {
    familyId: 1, owner: "a6221339@yahoo.com.tw", invitee: "littlelambmero@gmail.com"
  };
  account1: string = "littlelambmero@gmail.com";
  data20 = {
    "account": "littlelambmero@gmail.com",
    "familyId": 5
  };
  data21 = {
    "account": "a6221339@yahoo.com.tw",
    "year": 2025,
    "month": 6
  };
  data22 = {
    "account": "s6221339@yahoo.com.tw",
    "name": "郭旻諺",
    "phone": "0905779972",
    "birthday": "1993-01-21",
    "avatar": null
  };
  data23 = {
    "account": "a6221339@yahoo.com.tw",
    "oldPassword": "123456789",
    "newPassword": "12345678"
  };
  account2: string ="s6221339@yahoo.com.tw";
  data24: { code: string, account: string} = {
    code: "SaGYGKyE",
    account: "s6221339@yahoo.com.tw"
  };
  data25 = {
    "account": "s6221339@yahoo.com.tw",
    "newPassword": "ss941228"
  };
  account3: string ="d6221339@yahoo.com.tw";
  data26 = {
    "account": "s6221339@yahoo.com.tw",
    "year": 2025,
    "month": 0
  };


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

  inviteFamilyMember(){
    this.apiService.inviteFamilymember(this.data15)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('邀請家庭成員成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('邀請家庭成員失敗，請稍後再試');
    });
  }

  transferOwner(){
    this.apiService.transferOwner(this.data16)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('族長轉讓成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('族長轉讓失敗，請稍後再試');
    });
  }

  disbandFamily(){
    this.apiService.disbandFamily(this.data17)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('解散家庭成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('解散家庭失敗，請稍後再試');
    });
  }

  getUnacceptedFamilyInvitation(){
    this.apiService.getUnacceptedFamilyInvitation(this.familyId)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('顯示邀請中的家庭成員清單成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('顯示邀請中的家庭成員清單失敗，請稍後再試');
    });
  }

  leaveFamily(){
    this.apiService.leaveFamily(this.data18)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('退出家庭成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('退出家庭失敗，請稍後再試');
    });
  }

  cancelPendingInvitation(){
    this.apiService.cancelPendingInvitation(this.data19.familyId, this.data19.owner, this.data19.invitee)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('取消待邀請家庭成員成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('取消待邀請家庭成員失敗，請稍後再試');
    });
  }

  getFamilyInvitationByAccount(){
    this.apiService.getFamilyInvitationByAccount(this.account1)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('顯示帳號家庭邀請成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('顯示帳號家庭邀請失敗，請稍後再試');
    });
  }

  acceptFamilyInvitation(){
    this.apiService.acceptFamilyInvitation(this.data20)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('接受家庭邀請成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('接受家庭邀請失敗，請稍後再試');
    });
  }

  rejectFamilyInvitation(){
    this.apiService.rejectFamilyInvitation(this.data20)
    .then(res => {
        console.log('成功送出：', res.data);
        alert('拒絕家庭邀請成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('拒絕家庭邀請失敗，請稍後再試');
    });
  }

  logout(){
    this.apiService.logout()
    .then(res => {
        console.log('成功送出：', res.data);
        alert('登出帳號成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('登出帳號失敗，請稍後再試');
    });
  }

  getUserByAccount(){
    this.apiService.getUserByAccount(this.account)
      .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得會員資料成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得會員資料失敗，請稍後再試');
    });
  }

  getStatistics(){
    this.apiService.getStatistics(this.data21)
      .then(res => {
        console.log('成功送出：', res.data);
        alert('取得統計資料成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('取得統計資料失敗，請稍後再試');
    });
  }

  updateMemberInformation(){
    this.apiService.updateMemberInformation(this.data22)
      .then(res => {
          console.log('成功送出：', res.data);
          alert('編輯會員資料成功');
        })
        .catch(err => {
          console.error('送出失敗：', err);
          alert('編輯會員資料失敗，請稍後再試');
      });
  }

  updateUserPassword() {
    this.apiService.updateUserPassword(this.data23)
      .then(res => {
          console.log('成功送出：', res.data);
          alert('修改會員密碼成功');
        })
        .catch(err => {
          console.error('送出失敗：', err);
          alert('修改會員密碼失敗，請稍後再試');
      });
  }

  sendVerificationCode() {
    this.apiService.sendVerificationCode(this.account2)
      .then(res => {
          console.log('成功送出：', res.data);
          alert('傳送驗證信成功');
        })
        .catch(err => {
          console.error('送出失敗：', err);
          alert('傳送驗證信失敗，請稍後再試');
      });
  }

  checkVerificationCode(){
    this.apiService.checkVerificationCode(this.data24.code, this.data24.account)
      .then(res => {
          console.log('成功送出：', res.data);
          alert('認證驗證信成功');
        })
        .catch(err => {
          console.error('送出失敗：', err);
          alert('傳送驗證信失敗，請稍後再試');
      });
  }

  updatePasswordByEmail() {
    this.apiService.updatePasswordByEmail(this.data25)
      .then(res => {
          console.log('成功送出：', res.data);
          alert('修改密碼成功');
        })
        .catch(err => {
          console.error('送出失敗：', err);
          alert('修改密碼失敗，請稍後再試');
      });
  }

  deleteAccount() {
    this.apiService.deleteAccount(this.account3)
      .then(res => {
          console.log('成功送出：', res.data);
          alert('刪除帳號成功');
        })
        .catch(err => {
          console.error('送出失敗：', err);
          alert('刪除帳號失敗，請稍後再試');
      });
  }

  getMonthlyIncomeExpenseSummary() {
    this.apiService.getMonthlyIncomeExpenseSummary(this.data26)
      .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得總收支成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得總收支失敗，請稍後再試');
    });
  }

  getAccountTypeMonthlySummary() {
    this.apiService.getAccountTypeMonthlySummary(this.data26)
      .then(res => {
        console.log('成功送出：', res.data);
        alert('獲得帳戶每月所有類型收支成功');
      })
      .catch(err => {
        console.error('送出失敗：', err);
        alert('獲得帳戶每月所有類型收支失敗，請稍後再試');
    });
  }
}
