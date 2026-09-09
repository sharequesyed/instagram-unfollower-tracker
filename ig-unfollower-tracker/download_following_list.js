(async function getInstaData() {
  const ds_user_id = document.cookie.match(/ds_user_id=([0-9]+)/)?.[1];
  if (!ds_user_id) {
    console.error("Please log into Instagram first!");
    return;
  }

  async function fetchAll(endpoint) {
    let users = [];
    let maxId = null;
    console.log(`Fetching ${endpoint}...`);

    while (true) {
      let url = `https://www.instagram.com/api/v1/friendships/${ds_user_id}/${endpoint}/?count=50`;
      if (maxId) url += `&max_id=${maxId}`;

      const res = await fetch(url, {
        headers: {
          "X-IG-App-ID": "936619743392459",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!res.ok) {
        console.error(`Error fetching ${endpoint}:`, res.statusText);
        break;
      }

      const data = await res.json();
      const list = data.users || [];
      users = users.concat(list.map(u => ({
        value: u.username,
        href: `https://instagram.com/${u.username}`
      })));

      maxId = data.next_max_id;
      if (!maxId || list.length === 0) break;
      await new Promise(r => setTimeout(r, 600)); // Rate limit buffer
    }
    return users;
  }

  function downloadJSON(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  try {
    const following = await fetchAll("following");
    const followers = await fetchAll("followers");
    downloadJSON("following.json", following);
    downloadJSON("followers_1.json", followers);
    console.log("Both files downloaded successfully!");
  } catch (err) {
    console.error("Extraction error:", err);
  }
})();