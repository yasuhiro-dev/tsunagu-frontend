# Tsunagu Frontend

[Tsunagu](https://github.com/yasuhiro-dev/tsunagu) のフロントエンド（Next.js / TypeScript）です。

学校の個人面談日程を自動調整するサービスの画面部分を担当しています。教員・保護者・管理者それぞれの操作画面を提供します。

プロジェクト全体の背景・設計判断・画面・インフラ構成などの詳細は、[メインリポジトリのREADME](https://github.com/yasuhiro-dev/tsunagu)を参照してください。

## セットアップ（開発環境の起動）

このリポジトリには `docker-compose.yml` を含んでいません。開発環境は [tsunagu](https://github.com/yasuhiro-dev/tsunagu)（親リポジトリ）のDocker Compose構成を使って起動してください。

```bash
# コンテナ起動
docker compose up -d

# テスト実行
docker compose exec next_container npm run lint
```

## 技術スタック

- Next.js / TypeScript
- MUI（sxプロパティ中心）
- fetch API
