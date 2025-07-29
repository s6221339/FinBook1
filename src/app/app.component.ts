import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './@services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ){}

 // 基本屬性
  title = "智能記帳本" // 應用程式標題
  isLoggedIn = false // 用戶登入狀態
  isMenuOpen = false // 選單是否開啟
  scrolled = false // 頁面是否已滾動
  showScrollButton = false // 是否顯示回到頂部按鈕
  currentYear = new Date().getFullYear() // 當前年份（用於頁尾版權）
  gifSrc = `/notebook-change1.gif?${Date.now()}`; // 動態載入GIF圖片，避免快取問題
  isDarkMode = false;
  userName: string = '';

  ngOnInit(): void {
    //  監聽登入狀態
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userName = user?.name ?? '';
    });
  }

  // 監聽滾動事件
  @HostListener("window:scroll", [])
  onWindowScroll() {
    // 當滾動超過20px時，改變頁首樣式
    this.scrolled = window.scrollY > 20

    // 當滾動超過300px時，顯示回到頂部按鈕
    this.showScrollButton = window.scrollY > 300
  }

  // 切換選單顯示/隱藏
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen
  }

  // 模擬登入功能（之後會連接後端API）
  login() {
    this.router.navigate(['/login']);
  }

  // 模擬登出功能（之後會連接後端API）
  logout() {
    this.authService.logout().subscribe(success => {
      if(success) {
        this.router.navigate(['/login']);
      }
    });
  }

  // 平滑滾動到頁面頂部
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // 平滑滾動效果
    })
  }

  //  前往帳本畫面
  goLedger(){
    this.router.navigate(['/ledger']);
  }

  //  前往記帳畫面
  goBookKeeping(){
    this.router.navigate(['/bookKeeping/expenses']);
  }

  //  前往修改帳款畫面
  goModifyPayment(){
    this.router.navigate(['/modifyPayment']);
  }

  //  前往會員頁面
  goLogin(){
    this.router.navigate(['/login']);
  }
  // 前往首頁
  toHome() {
    this.router.navigate(['/home']);
  }

  // 鼠標移動到就刷新圖片
  gifUrl = 'notebook-while-one.gif';
  refreshGif() {
  // 加入時間戳讓圖片網址唯一，避免瀏覽器快取
  this.gifUrl = `notebook-while-one.gif?reload=${new Date().getTime()}`;
}

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    const body = document.body;
    if (this.isDarkMode) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }
  }

  goCreateFamily(){
    this.router.navigate(['/createFamily']);
  }

  goMyBalance(){
    this.router.navigate(['/myBalance']);
  }

  goMyFamily(){
    this.router.navigate(['/myFamily']);
  }

  goPendingDeletion(){
    this.router.navigate(['/pendingDeletion']);
  }

  goUnacceptedFamilyInvitation(){
    this.router.navigate(['/unacceptedFamilyInvitation']);
  }

  goTransfers(){
    this.router.navigate(['/transfers']);
  }

  goFixedIncomeExpenseForm(){
    this.router.navigate(['/fixedIncomeExpenseForm']);
  }
  goStatistics(){
    this.router.navigate(['/statistics']);
  }
  goMemberCenter(){
    this.router.navigate(['/memberCenter']);
  }
  // 判斷家庭管理選單是否應該 active
  isFamilyMenuActive() {
    return this.router.url.startsWith('/myFamily')
        || this.router.url.startsWith('/createFamily')
        || this.router.url.startsWith('/unacceptedFamilyInvitation')
        || this.router.url.startsWith('/transfers');
  }

  goFamilyLedger(){
    this.router.navigate(['/familyLedger']);
  }

}
