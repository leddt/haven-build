// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // WebKitGTK + NVIDIA on Wayland often crashes with:
    // "Gdk-Message: Error 71 (Protocol error) dispatching to Wayland display."
    // See https://v2.tauri.app/develop/debug/linux-graphics/
    #[cfg(target_os = "linux")]
    {
        set_env_default("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
        set_env_default("__NV_DISABLE_EXPLICIT_SYNC", "1");
    }

    haven_build_lib::run()
}

#[cfg(target_os = "linux")]
fn set_env_default(key: &str, value: &str) {
    if std::env::var_os(key).is_none() {
        // SAFETY: called once at process start before other threads exist.
        unsafe { std::env::set_var(key, value) };
    }
}
