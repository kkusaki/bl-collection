
(() => {
  "use strict";

  const client = window.supabaseClient;
  const authDialog = document.getElementById("authDialog");
  const authForm = document.getElementById("authForm");
  const authButton = document.getElementById("authButton");
  const authSwitch = document.getElementById("authSwitch");
  const authError = document.getElementById("authError");
  const authTitle = document.getElementById("authTitle");
  const authSubmit = document.getElementById("authSubmit");

  let isRegistering = false;
  let currentUser = null;

  function updateButton() {
    authButton.textContent = currentUser
      ? "登出 ♡"
      : "登入 / 註冊 ♡";
  }

  function showAuthDialog() {
    authError.textContent = "";
    authDialog.showModal();
  }

  function setMode(registering) {
    isRegistering = registering;
    authTitle.textContent = registering
      ? "註冊帳號"
      : "登入帳號";
    authSubmit.textContent = registering
      ? "註冊 ♡"
      : "登入 ♡";
    authSwitch.textContent = registering
      ? "已經有帳號？點此登入"
      : "還沒有帳號？點此註冊";
    authError.textContent = "";
  }

  authButton.addEventListener("click", async () => {
    if (currentUser) {
      const { error } = await client.auth.signOut();

      if (error) {
        alert(error.message);
        return;
      }

      currentUser = null;
      updateButton();
      window.location.reload();
    } else {
      showAuthDialog();
    }
  });

  authSwitch.addEventListener("click", (event) => {
    event.preventDefault();
    setMode(!isRegistering);
  });

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;

    authError.textContent = "";
    authSubmit.disabled = true;

    try {
      if (isRegistering) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin +
              window.location.pathname
          }
        });

        if (error) throw error;

        if (!data.session) {
          authError.textContent =
            "註冊成功！請到電子郵件確認帳號，再回來登入。";
          return;
        }
      } else {
        const { error } =
          await client.auth.signInWithPassword({
            email,
            password
          });

        if (error) throw error;
      }

      authDialog.close();
    } catch (error) {
      authError.textContent = error.message;
    } finally {
      authSubmit.disabled = false;
    }
  });

  client.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    updateButton();

    if (currentUser && authDialog.open) {
      authDialog.close();
    }
  });

  async function initializeAuth() {
    const { data, error } = await client.auth.getUser();

    if (error) {
      console.warn("Auth check:", error.message);
    }

    currentUser = data?.user || null;
    updateButton();

    if (!currentUser) {
      showAuthDialog();
    }
  }

  initializeAuth();
})();
