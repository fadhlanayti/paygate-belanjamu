---
name: gitflow
description: Git branch rules for Belanjamu PG repos (BE + FE + SDK). Read this skill before ANY code change.
---

# Gitflow Rules — MANDATORY

Berlaku untuk semua repo: `payget-belanjamu-backend` (BE), `neksjs-fr-pg` (FE), `paygate-belanjamu` (SDK).

## Branch Strategy

| Branch | Purpose | Source | Merge to | Delete after |
|--------|---------|--------|----------|--------------|
| `main` | **Production only** | — | — | Never |
| `feat-*` | Fitur baru | `main` | `main` | Yes |
| `fix-*` | Bugfix non-urgent | `main` | `main` | Yes |
| `hotfix-*` | Bug urgent di production | `main` | `main` (langsung) | Yes |

## Rules

1. **Jangan pernah commit langsung ke `main`.** Semua perubahan via branch `feat-*` / `fix-*` / `hotfix-*`.
2. **Satu branch = satu tujuan.** Contoh: `feat-wallet-wd`, `fix-webhook-timeout`, `hotfix-wd-double-debit`.
3. **Branch dari `main` yang fresh.** Sebelum bikin branch: `git checkout main && git pull`.
4. **Commit message format:** `type: short description` — type: `feat`, `fix`, `hotfix`, `docs`, `refactor`, `chore`, `test`.
5. **Push branch, jangan auto-merge.** Merge ke `main` hanya setelah user bilang OK / mantap.
6. **Hapus branch setelah merge:** `git branch -d <branch>` (lokal) + `git push origin --delete <branch>` (remote).
7. **Hotfix = fast track tapi tetap branch.** `hotfix-*` dari `main`, fix minimal (jangan bawa fitur baru), merge langsung tanpa nunggu review panjang, hapus setelah merge.

## Pre-Push Validation (WAJIB sebelum push)

**BE (Node.js backend):**
```bash
node -c <file-yang-diubah>.js   # setiap file JS yang diubah
```
Untuk migration baru di `src/models/migrations.js`: pastikan idempotent (pakai `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN` dalam try/catch `ER_DUP_FIELDNAME`, `INSERT IGNORE`).

**FE (Next.js):**
```bash
npx tsc --noEmit   # type check
```

**SDK:**
```bash
npx tsc --noEmit   # type check
npm test           # vitest, semua harus pass
npm run build      # tsup CJS+ESM+DTS harus sukses
```

## Workflow Contoh

```bash
# 1. Fitur baru
git checkout main && git pull
git checkout -b feat-nama-fitur
# ... ubah kode ...
# ... validasi sesuai repo (lihat Pre-Push Validation) ...
git add <files> && git commit -m "feat: deskripsi singkat" && git push -u origin feat-nama-fitur
# Tunggu user bilang OK → merge:
git checkout main && git pull && git merge feat-nama-fitur --no-edit && git push origin main
git branch -d feat-nama-fitur && git push origin --delete feat-nama-fitur

# 2. Hotfix production
git checkout main && git pull
git checkout -b hotfix-nama-bug
# ... fix minimal ...
# ... validasi ...
git add <files> && git commit -m "hotfix: deskripsi singkat" && git push -u origin hotfix-nama-bug
git checkout main && git pull && git merge hotfix-nama-bug --no-edit && git push origin main
git branch -d hotfix-nama-bug && git push origin --delete hotfix-nama-bug
```
