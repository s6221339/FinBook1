import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { ApiService } from '../../@services/api.service';
import { AxiosResponse } from 'axios';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-create-item',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
],
  templateUrl: './create-item.component.html',
  styleUrl: './create-item.component.scss'
})
export class CreateItemComponent {

  /**
  * 建構子：注入我們自訂的 ApiService
  * @param apiService 用來呼叫後端 API（axios 版）
  */
  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

   /**
   * mainCategories: 存放所有不重複的主分類 (type) 字串
   * 例如 ['交通', '其他', '娛樂', …]
   */
  mainCategories: string[] = [];

  /** 使用者目前選到的主分類 (type)，與 <select> 雙向綁定 */
  selectedCategory: string = '';

  /** 使用者在「細項名稱」欄位輸入的文字，與 <input> 雙向綁定 */
  newSubItem: string = '';

  /**
   * subItems: 用來顯示列表的資料，每筆包含:
   *  - id: any（目前沒有後端回傳的 id，暫留空字串）
   *  - type: 主分類
   *  - label: 細項名稱 (item)
   *  - value: 經過 toLowerCase() + replace(/\s/g, '_') 處理的值，用於前端比對
   */
  subItems: { id: any; type: string; label: string; value: string }[] = [];

  /**
   * groupedSubItems: 將 subItems 按 type 分組後的字典
   * keyed by type，value 是同一 type 底下的所有項目陣列
   */
  groupedSubItems: {
    [type: string]: Array<{ id: any; type: string; label: string; value: string }>
  } = {};

  /** 模擬目前登入使用者的帳號，實際可由 AuthService 取得 */
  currentAccount: string = 'a6221339';

  /**
   * ngOnInit: Angular 元件初始化完成後會執行
   * 這裡我們呼叫 fetchMainCategories() 來從後端取得「所有歷史的 (type, item)」。
   */
  ngOnInit(): void {
    console.log('ngOnInit()：開始執行 fetchMainCategories()');
    this.fetchMainCategories();
  }

  /**
   * fetchMainCategories(): 從後端取得所有 { type, item }，
   * 並且：
   *   1. 把所有不重複的 type 存到 mainCategories（用於下拉選單）。
   *   2. 把每筆 { type, item } 轉成 subItems 需要的格式，用於分組列表顯示。
   *   3. 將 subItems 按 type 分組，存到 groupedSubItems 以便模板直接使用。
   */
  fetchMainCategories(): void {
    console.log(
      'fetchMainCategories()：呼叫 ApiService.getTypeByAccount(',
      this.currentAccount,
      ')'
    );

    this.apiService.getTypeByAccount(this.currentAccount)
      .then((response: AxiosResponse<any>) => {
        console.log('fetchMainCategories() then() 收到 response.data =', response.data);

        // 從 response.data 中取出 paymentTypeList
        const allItems: { type: string; item: string }[] = response.data.paymentTypeList || [];
        console.log('fetchMainCategories() then() 解構後 allItems =', allItems);

        // 用 Set 收集不重複的 type
        const typeSet = new Set<string>();

        // 先清空 subItems 及 groupedSubItems
        this.subItems = [];
        this.groupedSubItems = {};

        // 逐筆處理並填充 subItems
        allItems.forEach((vo: { type: string; item: string }) => {
          typeSet.add(vo.type);

          const entry = {
            id: '',
            type: vo.type,
            label: vo.item,
            value: vo.item.toLowerCase().replace(/\s/g, '_')
          };
          // 把History資料 push 進 subItems
          this.subItems.push(entry);
        });

        // 构造 mainCategories 陣列
        this.mainCategories = Array.from(typeSet);

        // 分組 subItems，依 type 建立 groupedSubItems
        this.mainCategories.forEach((cat) => {
          this.groupedSubItems[cat] = this.subItems.filter(item => item.type === cat);
        });

        console.log('fetchMainCategories() then() 處理後 mainCategories =', this.mainCategories);
        console.log('fetchMainCategories() then() groupedSubItems =', this.groupedSubItems);
      })
      .catch((error: any) => {
        console.error('fetchMainCategories() catch() 錯誤 =', error);
        Swal.fire('無法載入歷史資料，請稍後再試', '', 'error');
      });
  }

  /**
   * addSubItem(): 處理「新增細項」的流程
   *   a. 確認使用者已選擇主分類 (selectedCategory)
   *   b. 確認 newSubItem (文字輸入) 並非空值
   *   c. 在前端 subItems 中比對同一分類下是否已有相同 label 或 value
   *   d. 若前端沒重複，呼叫 ApiService.createType() 送給後端最終檢查/新增
   *   e. 若後端回傳 code === 200，顯示 SweetAlert2 成功提示，並把新項目 unshift 到 subItems／更新分組
   *   f. 若後端回傳非 200 code，顯示錯誤提示
   *   g. 新增完成後，清空輸入框
   */
  addSubItem(): void {
    // a. 如果 selectedCategory 是空字串，代表使用者還沒選分類
    if (!this.selectedCategory) {
      Swal.fire('請先選擇一個分類', '', 'warning');
      return;
    }

    // b. 去除 newSubItem 前後空白後，如果還是空字串，就不做任何事
    if (!this.newSubItem.trim()) {
      return;
    }
    const inputLabel: string = this.newSubItem.trim();
    const inputValue: string = inputLabel.toLowerCase().replace(/\s/g, '_');

    // c. 在前端 subItems 中比對同一分類底下的 label 或 value 是否重複
    const localDuplicate: boolean = this.subItems.some((item) =>
      item.type === this.selectedCategory &&
      (
        item.label.toLowerCase() === inputLabel.toLowerCase() ||
        item.value === inputValue
      )
    );
    if (localDuplicate) {
      Swal.fire('此細項已在列表中，請勿重複新增', '', 'info');
      return;
    }

    // d. 前端沒重複，組成 payload 傳給後端
    const payload: { type: string; item: string; account: string } = {
      type: this.selectedCategory,
      item: inputLabel,
      account: this.currentAccount
    };
    console.log('addSubItem()：呼叫 ApiService.createType，payload =', payload);

    this.apiService.createType(payload)
      .then((res: AxiosResponse<any>) => {
        console.log('addSubItem() then() 收到 res.data =', res.data);
        // 若後端回傳 code === 200，視為新增成功
        if (res.data.code === 200) {
          // e. 新增成功
          Swal.fire({
            title: '新增成功',
            text: `"${inputLabel}" 已加入 "${this.selectedCategory}"`,
            icon: 'success',
            timer: 5000,
            showConfirmButton: false
          });

          // 把新資料 unshift 到 subItems (最新一筆在最上方)
          const newEntry = {
            id: '',
            type: this.selectedCategory,
            label: inputLabel,
            value: inputValue
          };
          this.subItems.unshift(newEntry);

          // 更新分組：若 groupedSubItems 已有此分類，就 unshift；否則建立新分組
          if (this.groupedSubItems[this.selectedCategory]) {
            this.groupedSubItems[this.selectedCategory].unshift(newEntry);
          } else {
            this.groupedSubItems[this.selectedCategory] = [newEntry];
            // 同時也要把分類加到 mainCategories
            this.mainCategories.push(this.selectedCategory);
          }

          // f. 清空輸入框
          this.newSubItem = '';
        } else {
          // f. code ≠ 200，顯示錯誤提示
          console.error('addSubItem() then() 後端回傳非200 code =', res.data);
          Swal.fire('新增失敗，請稍後再試', '', 'error');
        }
      })
      .catch((err: any) => {
        console.error('addSubItem() catch() 呼叫 createType 發生錯誤 =', err);
        Swal.fire('網路或伺服器錯誤，請稍後再試', '', 'error');
      });

    //  優先從 queryParams 抓 From ，如果沒有就預設回/home
    const from = this.route.snapshot.queryParamMap.get('from') ?? 'home';
    this.router.navigateByUrl(from);
  }

  /**
   * cancel(): 處理「取消」按鈕的動作
   * 1. 清空細項輸入框
   * 2. (可選) 重設 selectedCategory，如果想要清掉分類
   * 3.回到填寫款項頁面
   */
  cancel(): void {
    //  優先從 queryParams 抓 From ，如果沒有就預設回/home
    const from = this.route.snapshot.queryParamMap.get('from') ?? 'home';
    this.router.navigateByUrl(from);
  }

}
