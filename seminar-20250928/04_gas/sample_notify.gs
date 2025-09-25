/**
 * Google Apps Script - タスク通知自動化サンプル
 * Spreadsheet → Gmail 通知の雛形
 *
 * 使用方法:
 * 1. Google Apps Scriptで新しいプロジェクトを作成
 * 2. このコードをコピペ
 * 3. スプレッドシートIDとメールアドレスを設定
 * 4. トリガーを設定（時間主導型 or イベント主導型）
 */

// ========== 設定 ==========
const CONFIG = {
  // スプレッドシートID（URLのd/xxxxx/editの部分）
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',

  // シート名
  SHEET_NAME: 'タスク一覧',

  // 通知先メールアドレス
  EMAIL_TO: 'your-email@example.com',

  // 送信者名
  EMAIL_FROM_NAME: 'タスク通知システム',

  // 列の設定（A列=1, B列=2...）
  COLUMNS: {
    TASK_NAME: 1,      // A列: タスク名
    DUE_DATE: 2,       // B列: 期限
    STATUS: 3,         // C列: ステータス
    ASSIGNEE: 4,       // D列: 担当者
    PRIORITY: 5,       // E列: 優先度
    LAST_NOTIFIED: 6   // F列: 最終通知日
  }
};

/**
 * メイン関数 - 期限切れタスクをチェックして通知
 */
function checkAndNotifyTasks() {
  try {
    console.log('タスク通知チェック開始');

    // スプレッドシートを開く
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
      throw new Error(`シート '${CONFIG.SHEET_NAME}' が見つかりません`);
    }

    // データを取得（ヘッダー行を除く）
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];
    const tasks = values.slice(1);

    // 通知対象タスクをフィルタリング
    const tasksToNotify = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach((task, index) => {
      const rowIndex = index + 2; // ヘッダー分+1, 0ベース補正+1

      const taskName = task[CONFIG.COLUMNS.TASK_NAME - 1];
      const dueDate = task[CONFIG.COLUMNS.DUE_DATE - 1];
      const status = task[CONFIG.COLUMNS.STATUS - 1];
      const assignee = task[CONFIG.COLUMNS.ASSIGNEE - 1];
      const priority = task[CONFIG.COLUMNS.PRIORITY - 1];
      const lastNotified = task[CONFIG.COLUMNS.LAST_NOTIFIED - 1];

      // 空行をスキップ
      if (!taskName) return;

      // 完了済みタスクをスキップ
      if (status === '完了' || status === 'Done') return;

      // 期限チェック
      let shouldNotify = false;
      let notifyReason = '';

      if (dueDate instanceof Date) {
        const dueDateOnly = new Date(dueDate);
        dueDateOnly.setHours(0, 0, 0, 0);

        const daysDiff = Math.floor((dueDateOnly - today) / (1000 * 60 * 60 * 24));

        if (daysDiff < 0) {
          // 期限超過
          shouldNotify = true;
          notifyReason = `期限超過（${Math.abs(daysDiff)}日経過）`;
        } else if (daysDiff === 0) {
          // 今日が期限
          shouldNotify = true;
          notifyReason = '本日期限';
        } else if (daysDiff === 1) {
          // 明日が期限
          shouldNotify = true;
          notifyReason = '明日期限';
        } else if (priority === '高' && daysDiff <= 3) {
          // 高優先度は3日前から
          shouldNotify = true;
          notifyReason = `高優先度（${daysDiff}日後期限）`;
        }
      }

      // 重複通知を避ける（同日通知済みの場合）
      if (shouldNotify && lastNotified instanceof Date) {
        const lastNotifiedDate = new Date(lastNotified);
        lastNotifiedDate.setHours(0, 0, 0, 0);

        if (lastNotifiedDate.getTime() === today.getTime()) {
          shouldNotify = false; // 今日既に通知済み
        }
      }

      if (shouldNotify) {
        tasksToNotify.push({
          rowIndex,
          taskName,
          dueDate,
          status,
          assignee,
          priority,
          notifyReason
        });
      }
    });

    // 通知送信
    if (tasksToNotify.length > 0) {
      sendNotificationEmail(tasksToNotify);
      updateLastNotifiedDates(sheet, tasksToNotify);
      console.log(`${tasksToNotify.length}件のタスクについて通知を送信しました`);
    } else {
      console.log('通知対象のタスクはありません');
    }

  } catch (error) {
    console.error('エラーが発生しました:', error);

    // エラー通知（オプション）
    GmailApp.sendEmail(
      CONFIG.EMAIL_TO,
      '【エラー】タスク通知システム',
      `タスク通知の処理中にエラーが発生しました:\n\n${error.toString()}\n\n時刻: ${new Date().toLocaleString('ja-JP')}`
    );
  }
}

/**
 * 通知メールを送信
 */
function sendNotificationEmail(tasks) {
  const subject = `【タスク通知】期限間近・超過のタスクがあります (${tasks.length}件)`;

  let body = `タスクの期限チェック結果をお知らせします。\n\n`;
  body += `通知日時: ${new Date().toLocaleString('ja-JP')}\n`;
  body += `対象タスク数: ${tasks.length}件\n\n`;
  body += `==========================================\n\n`;

  tasks.forEach((task, index) => {
    body += `${index + 1}. ${task.taskName}\n`;
    body += `   期限: ${task.dueDate ? task.dueDate.toLocaleDateString('ja-JP') : '未設定'}\n`;
    body += `   状態: ${task.status || '未設定'}\n`;
    body += `   担当: ${task.assignee || '未設定'}\n`;
    body += `   優先度: ${task.priority || '未設定'}\n`;
    body += `   理由: ${task.notifyReason}\n\n`;
  });

  body += `==========================================\n\n`;
  body += `スプレッドシートで詳細を確認してください:\n`;
  body += `https://docs.google.com/spreadsheets/d/${CONFIG.SPREADSHEET_ID}\n\n`;
  body += `※ このメールは自動送信されています。`;

  GmailApp.sendEmail(CONFIG.EMAIL_TO, subject, body);
}

/**
 * 最終通知日を更新
 */
function updateLastNotifiedDates(sheet, tasks) {
  const today = new Date();

  tasks.forEach(task => {
    sheet.getRange(task.rowIndex, CONFIG.COLUMNS.LAST_NOTIFIED).setValue(today);
  });
}

/**
 * テスト実行用関数
 */
function testNotification() {
  // テスト用のダミータスクで通知テスト
  const testTasks = [{
    rowIndex: 999,
    taskName: 'テストタスク',
    dueDate: new Date(),
    status: '進行中',
    assignee: 'テストユーザー',
    priority: '中',
    notifyReason: 'テスト実行'
  }];

  sendNotificationEmail(testTasks);
  console.log('テスト通知を送信しました');
}

/**
 * スプレッドシートの初期セットアップ
 * 初回実行時に列ヘッダーを設定
 */
function setupSpreadsheet() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
                                .getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
      throw new Error(`シート '${CONFIG.SHEET_NAME}' が見つかりません`);
    }

    // ヘッダー行を設定
    const headers = ['タスク名', '期限', 'ステータス', '担当者', '優先度', '最終通知日'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // ヘッダー行のスタイル設定
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');

    // 列幅の自動調整
    sheet.autoResizeColumns(1, headers.length);

    console.log('スプレッドシートのセットアップが完了しました');

  } catch (error) {
    console.error('セットアップエラー:', error);
  }
}

/**
 * トリガー設定の例
 *
 * 時間主導型トリガー（毎日午前9時に実行）の設定方法:
 * 1. Apps Scriptエディタで「トリガー」タブを開く
 * 2. 「トリガーを追加」をクリック
 * 3. 以下を設定:
 *    - 実行する関数: checkAndNotifyTasks
 *    - イベントのソース: 時間主導型
 *    - 時間ベースのトリガー: 日タイマー
 *    - 時刻: 午前9時〜10時
 */