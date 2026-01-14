const MAGIC_BYTE = "=madebyunixity=";

async function importGlobalSave(file) {
  if (!file) return;
  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      const fileContent = e.target.result;

      const hasHeader = fileContent.startsWith(MAGIC_BYTE);
      const hasFooter = fileContent.endsWith(MAGIC_BYTE);

      if (!hasHeader || !hasFooter) {
        throw new Error("Unauthorized file format. Magic bytes missing.");
      }

      const base64Data = fileContent.substring(MAGIC_BYTE.length, fileContent.length - MAGIC_BYTE.length);
      const rawData = decodeURIComponent(escape(atob(base64Data)));
      const data = JSON.parse(rawData);

      if (data.site !== "Gaming Reimagined") {
        throw new Error("Incompatible save source.");
      }

      if (!confirm("Restore progress? This will only overwrite data present in the backup.")) return;

      Object.keys(data.local).forEach(k => {
        localStorage.setItem(k, data.local[k]);
      });

      for (let dbName in data.idb) {
        await injectIDB(dbName, data.idb[dbName]);
      }

      alert("Restoration successful! Reloading...");
      window.location.reload();
    } catch (err) {
      alert("Failed to load: " + err.message);
    }
  };
  reader.readAsText(file);
}

async function injectIDB(name, content) {
  return new Promise((resolve) => {
    const req = indexedDB.open(name);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      for (let sName in content) {
        if (!db.objectStoreNames.contains(sName)) {
          db.createObjectStore(sName);
        }
      }
    };

    req.onsuccess = () => {
      const db = req.result;
      
      for (let sName in content) {
        if (!db.objectStoreNames.contains(sName)) continue;
        
        const tx = db.transaction(sName, "readwrite");
        const store = tx.objectStore(sName);
        
        store.clear(); 
        const storeData = content[sName];
        Object.keys(storeData).forEach(k => {
          store.put(storeData[k], k);
        });
      }
      
      db.close();
      resolve();
    };
    
    req.onerror = () => resolve();
  });
}
async function exportGlobalSave() {
  const backup = {
    site: "Gaming Reimagined",
    date: new Date().toISOString(),
    local: { ...localStorage },
    idb: {}
  };

  try {
    if (window.indexedDB.databases) {
      const dbList = await window.indexedDB.databases();
      for (let dbInfo of dbList) {
        if (!dbInfo.name) continue;
        backup.idb[dbInfo.name] = await extractIDB(dbInfo.name);
      }
    }

    const jsonString = JSON.stringify(backup);
    const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
    
    const finalPackage = MAGIC_BYTE + encodedData + MAGIC_BYTE;
    
    const blob = new Blob([finalPackage], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `GamingReimaginedSave_${new Date().toLocaleDateString().replace(/\//g, '-')}.grs`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("Global backup exported successfully.");
  } catch (err) {
    alert("Error creating backup: " + err.message);
  }
}

async function extractIDB(name) {
  return new Promise((resolve) => {
    const req = indexedDB.open(name);
    
    req.onsuccess = async () => {
      const db = req.result;
      const result = {};
      const storeNames = Array.from(db.objectStoreNames);
      
      for (let sName of storeNames) {
        result[sName] = await new Promise((res) => {
          const tx = db.transaction(sName, "readonly");
          const store = tx.objectStore(sName);
          const allDataReq = store.getAll();
          const allKeysReq = store.getAllKeys();
          
          allDataReq.onsuccess = () => {
            allKeysReq.onsuccess = () => {
              const storeMap = {};
              allKeysReq.result.forEach((key, i) => {
                storeMap[key] = allDataReq.result[i];
              });
              res(storeMap);
            };
          };
          
          allDataReq.onerror = () => res({});
        });
      }
      
      db.close();
      resolve(result);
    };
    
    req.onerror = () => resolve({});
  });
}