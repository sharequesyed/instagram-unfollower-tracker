(async function getInstaData() {
  const d = document.cookie.match(/ds_user_id=([0-9]+)/)?.[1];
  if (!d) {
    alert("Log into Instagram first!");
    return;
  }

  async function f(e) {
    let u = [], m = null;
    while (true) {
      let l = `https://www.instagram.com/api/v1/friendships/${d}/${e}/?count=50`;
      if (m) l += `&max_id=${m}`;
      const r = await fetch(l, {
        headers: {
          "X-IG-App-ID": "936619743392459",
          "X-Requested-With": "XMLHttpRequest"
        }
      });
      if (!r.ok) break;
      const j = await r.json(), s = j.users || [];
      u = u.concat(s.map(x => ({
        value: x.username,
        full_name: x.full_name || "",
        profile_pic_url: x.profile_pic_url || "",
        href: `https://instagram.com/${x.username}`
      })));
      m = j.next_max_id;
      if (!m || s.length === 0) break;
      await new Promise(w => setTimeout(w, 500));
    }
    return u;
  }

  function dl(n, t) {
    const b = new Blob([JSON.stringify(t, null, 2)], { type: "application/json" }),
      a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = n;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const fg = await f("following"), fr = await f("followers");
  dl("following.json", fg);
  dl("followers_1.json", fr);
})();