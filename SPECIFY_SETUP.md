# Spec Kit (`specify-cli`) Setup & Troubleshooting Guide

This guide covers everything you need to know about installing, initializing, and troubleshooting GitHub's **Spec Kit** (`specify-cli`) with **Antigravity**.

---

## ⚡ Quick Note: Do You Even Need to Install `specify-cli`?

**If you are cloning this repository, NO installation is strictly required!**

This repository already includes:
- **`.agents/skills/`**: The complete suite of pre-configured Antigravity skills.
- **`.specify/`**: All core specification templates, PowerShell helper scripts, and workflow configurations.

You can directly open this project inside the **Antigravity IDE** and immediately start running Spec Kit slash commands (such as `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`). 

*Read below only if you want to install `specify-cli` globally on your machine, initialize fresh projects from scratch, or understand how the integration works.*

---

## 📋 Prerequisites

Before installing `specify-cli`, verify your environment:

1. **Python**: Version 3.11 or higher (Python 3.12+ recommended).
   ```powershell
   python --version
   ```
2. **Git**: Installed and configured on your system.
   ```powershell
   git --version
   ```
3. **PowerShell Execution Policy** (Windows only): Ensure script execution is enabled for virtual environments and Spec Kit automation scripts:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

---

## 🚀 Installation Methods

Spec Kit can be installed either as a **standalone global CLI** (recommended by the Spec Kit team) or inside a **project-isolated virtual environment**.

### Option 1: Standalone Global CLI (Recommended)

Installing globally makes the `specify` command accessible across any directory in your terminal without requiring an active virtual environment.

> [!IMPORTANT]
> **Ensure no virtual environment is active** before running global installation commands (`deactivate`). Global tool managers (`uv`, `pipx`) manage their own isolated environments.

1. **Deactivate any active virtual environment:**
   ```powershell
   deactivate
   ```
2. **Install using `uv` or `pipx`:**
   - **Using `uv`:**
     ```powershell
     uv tool install specify-cli
     ```
   - **Using `pipx`:**
     ```powershell
     pipx install specify-cli
     ```

---

### Option 2: Local Virtual Environment (`venv` + `pip`)

If you prefer keeping `specify-cli` strictly localized to a specific repository:

1. **Navigate to the project folder:**
   ```powershell
   cd <path-to-your-project-folder>
   ```
2. **Create and activate a virtual environment:**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. **Install `specify-cli` via `pip`:**
   ```powershell
   pip install specify-cli
   ```

---

## ⚙️ Initializing Spec Kit for Antigravity

To scaffold Spec Kit in a project directory configured for Antigravity:

```powershell
specify init --here --integration agy --ignore-agent-tools
```

> [!TIP]
> If your project directory already contains existing files (e.g., `.git`, `.venv`, `.gitignore`), append the `--force` flag so Spec Kit merges templates without prompting:
> ```powershell
> specify init --here --integration agy --ignore-agent-tools --force
> ```

---

## 🔍 Troubleshooting & Known Errors

### 1. `Agent Detection Error: agy not found`
* **Symptom:**
  ```text
  Agent Detection Error
  agy not found
  Install from: https://antigravity.google/
  Antigravity is required to continue with this project type.
  ```
* **Why it happens:** Spec Kit inspects your terminal's system `PATH` for the standalone `agy` executable. When using the **Antigravity IDE** desktop application, the CLI binary might not be exposed on your terminal `PATH`.
* **The Fix:** Add `--ignore-agent-tools` to bypass the binary check:
  ```powershell
  specify init --here --integration agy --ignore-agent-tools
  ```

---

### 2. `Directory not empty` Warning
* **Symptom:** The CLI refuses to initialize because files already exist in the folder.
* **The Fix:** Add the `--force` flag:
  ```powershell
  specify init --here --integration agy --ignore-agent-tools --force
  ```

---

### 3. Execution Policy Script Blocking (Windows)
* **Symptom:** Scripts in `.specify/scripts/powershell/` fail with:
  `File ... cannot be loaded because running scripts is disabled on this system.`
* **The Fix:** Run this command once in PowerShell:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---

## 🗄️ How Machine-Local JSON Storage Works

When practicing Spec-Driven Development, Spec Kit creates machine-local state files:
* **`.specify/feature.json`**: Acts as dynamic session storage, remembering the active feature you are working on (e.g., `{"feature_directory": "specs\\001-doctor-appointment-booking"}`).
* **Why it is ignored in Git:** `feature.json` is user-local workspace state. If multiple developers or branches worked on different features, committing `feature.json` would cause continuous Git conflicts. 
* Spec Kit includes a built-in `.specify/.gitignore`, and the root `.gitignore` explicitly ignores `.specify/feature.json`.

