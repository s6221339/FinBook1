import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

   constructor(private router: Router) {}
  // 主要功能特色列表
  features = [
    {
      icon: "smart_toy", // AI機器人圖標
      title: "AI智能分析",
      description: "運用人工智能技術，自動分析您的消費習慣，提供個人化的理財建議。",
      color: "#3b82f6", // 藍色
    },
    {
      icon: "family_restroom", // 家庭圖標
      title: "家庭共享記帳",
      description: "支援多人共同記帳，家庭成員可以一起管理家庭財務，透明化支出。",
      color: "#ec4899", // 粉色
    },
    {
      icon: "analytics", // 分析圖標
      title: "智能統計報表",
      description: "自動生成詳細的財務報表，包含圓餅圖、長條圖等多種視覺化圖表。",
      color: "#10b981", // 綠色
    },
    {
      icon: "schedule", // 時間圖標
      title: "固定支出管理",
      description: "自動記錄房租、水電費等固定支出，提醒您即將到期的繳費項目。",
      color: "#f59e0b", // 橘色
    },
  ]
}


