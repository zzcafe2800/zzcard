# ズズラジオ体操部 PC版（Windows）

中身は いつもの サイトを 開くので、**サイトを 更新すれば PC版も 自動で 最新**になります。
この desktop フォルダを 作りなおすのは、PC版そのもの（まど・つなぎ・アイコン など）を かえる 時だけです。

## はじめて 出す とき
1. リポジトリ（zzcard）に `desktop` フォルダと `.github/workflows/desktop.yml` を 入れる
2. GitHub の **Actions** → **PC版をつくる** → **Run workflow**
3. 10分くらいで **Releases** に `zzcard-setup.exe` が できる
4. サイトの 設定 → **PC版** → **ダウンロード** で 入れられる

## 新しい版を 出す とき
`desktop/package.json` の `"version"` を 1つ 上げて（例：0.1.0 → 0.1.1）、もう一度 **Run workflow**。
入れている人の PC版は、つぎに 開いた時に 自動で 新しい版に なります。
