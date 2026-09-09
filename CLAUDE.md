## gitflow

**WAJIB: Baca dan ikuti `.claude/skills/gitflow/SKILL.md` sebelum melakukan perubahan apapun pada kode di repo ini.**

Rules ringkas:
- `main` = production only. JANGAN commit langsung ke main.
- Fitur baru → branch `feat-*` dari main
- Bugfix non-urgent → branch `fix-*` dari main  
- Bug urgent production → branch `hotfix-*` dari main, merge cepat
- Hapus branch setelah merge
- Validasi (tsc + test + build) WAJIB sebelum push
- Merge ke main hanya setelah user konfirmasi OK
