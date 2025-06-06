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
    RouterOutlet,
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
   * categories: 從後端拿回的 paymentTypeList 裡面所有不重複的 type
   * （對應後端欄位 paymentTypeList[i].type）
   */
  categories: string[] = []

  /**
   * selectedCategory: 綁在下拉選單 (主分類)，例如 "交通"、"飲食"
   * 由使用者選擇
   */
  selectedCategory = ""

  /**
   * newItem: 綁在輸入框 (細項名稱)，例如 "停車費"、"咖啡"
   * 使用者輸入
   */
  newItem = ""

  /**
   * paymentTypeList: 後端真正回傳的陣列，
   * 每個元素是 { type: string, item: string }
   */
  paymentTypeList: { type: string; item: string }[] = []

  /**
   * groupedItems: 把 paymentTypeList 按 type 分組後的字典
   * keyed by type（主分類字串），value 是該分類底下所有 { type, item }
   */
  groupedItems: {
    [type: string]: Array<{ type: string; item: string }>
  } = {}

  /**
   * collapsed: 紀錄每個分類是否收合
   * keyed by type，value = true 表示「已收合」、false 表示「展開」
   */
  collapsed: { [type: string]: boolean } = {}

  /** 模擬目前登入的帳號；後續可改由 AuthService 提供 */
  currentAccount = "a6221339"

  /** ngOnInit：元件初始化完成後，載入後端資料 */
  ngOnInit(): void {
    this.fetchAllItems()
  }

  /**
   * fetchAllItems():
   * 1. 呼叫後端 getType API 拿到 paymentTypeList
   * 2. 用 forEach 把資料暫存到 this.paymentTypeList
   * 3. 用 forEach + filter 將資料分組到 groupedItems
   * 4. 初始化 collapsed 對應每個分類為展開 (false)
   */
  fetchAllItems(): void {
    this.apiService
      .getTypeByAccount(this.currentAccount)
      .then((response: AxiosResponse<any>) => {
        // 後端 response.data 應包含 { code, message, paymentTypeList }
        console.log("後端回傳 response.data =", response.data)

        // 取出真正的 paymentTypeList (陣列)
        const list: { type: string; item: string }[] = response.data.paymentTypeList || []

        // 先清空所有
        this.paymentTypeList = []
        this.categories = []
        this.groupedItems = {}
        this.collapsed = {}

        // 1. 把所有拿到的元素放進 this.paymentTypeList
        list.forEach((vo) => {
          // vo.type 對應後端的 type
          // vo.item 對應後端的 item
          this.paymentTypeList.push({ type: vo.type, item: vo.item })
        })

        // 2. 用一個 Set 先收集所有不重複的 type
        const typeSet = new Set<string>()
        this.paymentTypeList.forEach((vo) => {
          typeSet.add(vo.type)
        })
        // 再把 Set 轉成陣列存到 this.categories
        this.categories = Array.from(typeSet)

        // 3. 按分類分組到 groupedItems
        this.categories.forEach((cat) => {
          // filter 出 this.paymentTypeList 裡面 type === cat 的項目
          const itemsOfCat = this.paymentTypeList.filter((entry) => entry.type === cat)
          this.groupedItems[cat] = itemsOfCat
          // 一開始就縮起來
          this.collapsed[cat] = true
        })

        console.log("分組後 groupedItems =", this.groupedItems)
        console.log("collapsed 初始狀態 =", this.collapsed)
      })
      .catch((error: any) => {
        console.error("fetchAllItems() 發生錯誤 =", error)
        Swal.fire("無法載入分類資料，請稍後再試", "", "error")
      })
  }

  /**
   * addItem():
   * 1. 確認已選分類，若沒選就彈 SweetAlert2 警告
   * 2. 確認 newItem (細項名稱) 不是空字串，若空就彈警告
   * 3. 用 forEach 檢查該分類底下是否已有相同 item
   * 4. 與後端 createType API 溝通
   * 5. 如果後端回 200，則把新項目 unshift 到 paymentTypeList、groupedItems
   * 6. 清空 newItem
   */
  addItem(): void {
    // 1. 若未選分類
    if (!this.selectedCategory) {
      Swal.fire("請先選擇主分類", "", "warning")
      return
    }

    // 2. 若沒輸入細項
    if (!this.newItem.trim()) {
      Swal.fire("請輸入細項名稱", "", "warning")
      return
    }
    const itemLabel = this.newItem.trim()

    // 3. 用 forEach 檢查 groupedItems[選的分類] 裡是否有相同的 item
    let isDuplicate = false
    this.groupedItems[this.selectedCategory].forEach((entry) => {
      if (entry.item.toLowerCase() === itemLabel.toLowerCase()) {
        isDuplicate = true
      }
    })
    if (isDuplicate) {
      Swal.fire("此細項已存在，請勿重複新增", "", "error")
      return
    }

    // 4. 呼叫後端 createType API
    const payload = {
      type: this.selectedCategory,
      item: itemLabel,
      account: this.currentAccount,
    }
    console.log("addItem() 傳 payload =", payload)

    this.apiService
      .createType(payload)
      .then((res: AxiosResponse<any>) => {
        console.log("addItem() 收到 res.data =", res.data)
        // 如果後端回 { code: 200, message: '成功！' }
        if (res.data.code === 200) {
          Swal.fire({
            title: "新增成功",
            text: `"${itemLabel}" 已加入 "${this.selectedCategory}"`,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          })

          // 新增到 paymentTypeList
          const newEntry = { type: this.selectedCategory, item: itemLabel }
          this.paymentTypeList.unshift(newEntry)

          // 新增到 groupedItems
          if (this.groupedItems[this.selectedCategory]) {
            this.groupedItems[this.selectedCategory].unshift(newEntry)
          } else {
            // 如果 groupedItems 裡本來沒有這個分類
            this.groupedItems[this.selectedCategory] = [newEntry]
            this.collapsed[this.selectedCategory] = false
            this.categories.push(this.selectedCategory)
          }

          // 5. 清空 newItem
          this.newItem = "";
        } else {
          Swal.fire("新增失敗，請稍後再試", "", "error");
        }
      })
      .catch((err: any) => {
        console.error("addItem() 發生錯誤 =", err);
        Swal.fire("網路或伺服器錯誤，請稍後再試", "", "error");
      });
    //  優先從 queryParams 抓 From ，如果沒有就預設回/home
    const from = this.route.snapshot.queryParamMap.get('from') ?? 'home';
    this.router.navigateByUrl(from);
  }

  /**
   * 清空表單
   */
  clearForm(): void {
    this.selectedCategory = ""
    this.newItem = ""
  }

  /**
   * 返回首頁
   */
  cancel(): void {
    //  優先從 queryParams 抓 From ，如果沒有就預設回/home
    const from = this.route.snapshot.queryParamMap.get('from') ?? 'home';
    this.router.navigateByUrl(from);
  }

  /**
   * toggleCollapse(type): 切換指定分類的收合狀態
   * collapsed[type] = !collapsed[type]
   */
  toggleCollapse(type: string): void {
    this.collapsed[type] = !this.collapsed[type]
  }

  /**
   * 計算總細項數量
   */
  getTotalItemCount(): number {
    return this.paymentTypeList.length
  }
}
