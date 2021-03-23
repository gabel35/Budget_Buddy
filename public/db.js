let db;
const request = indexedDB.open(`budget`, 1);

request.onupgradeneeded = event => {
  const db = request.result;
  db.createObjectStore('pending', { autoIncrement:  true });
  console.log(event);
};

request.onsuccess = event => {
  if(navigator.onLine) {
      checkDatabase();
  }
};

request.onerror = event => console.error(event);

function saveRecord() {
  const db = request.result;
  const transaction = db.transaction['pending', 'readwrite'];
  const budgetStore = transaction.objectStore('pending');
  budgetStore.add(record);
};

function checkDatabase() {
  const db = request.result;
  const transaction = db.transaction(['pending'], 'readwrite');
  const budgetStore = transaction.objectStore('pending');
  const getAll = budgetStore.getAll();

  getAll.onsuccess = function() {
    if(getAll.result.length > 0) {
      fetch(`/api/transaction/bulk`, {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: `application/json, text/plain, */*`,
          "Content-Type": `application/json`
        }
      })
      .then((response) => response.json())
      .then(() => {
        transaction = db.transaction['pending', 'readwrite'];
        budgetStore = transaction.objectStore('pending');
        budgetStore.clear();
      });
    }
  };
};

window.addEventListener('online', checkDatabase);
