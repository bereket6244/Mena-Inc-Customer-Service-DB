import { getFirebaseDb, OperationType, handleFirestoreError } from './firebase';
import { Customer, PaperStock, BankAccount } from '../types';

// Fetch Paper Stocks with local fallback verification
export async function fetchAllPaperStocks(localFallback: PaperStock[]): Promise<PaperStock[]> {
  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) {
    return localFallback;
  }

  try {
    const { collection, getDocsFromServer, doc, setDoc } = await import('firebase/firestore');
    const snapshot = await getDocsFromServer(collection(db, 'paperStocks'));
    
    if (snapshot.empty) {
      // Seed Firestore with initial stockroom values if empty
      const seededStocks: PaperStock[] = [];
      for (const stock of localFallback) {
        await setDoc(doc(db, 'paperStocks', stock.id), stock);
        seededStocks.push(stock);
      }
      return seededStocks;
    }
    
    const stocks: PaperStock[] = [];
    snapshot.forEach(docRef => {
      stocks.push(docRef.data() as PaperStock);
    });
    return stocks;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'paperStocks');
    return localFallback;
  }
}

// Fetch Customers with local fallback verification
export async function fetchAllCustomers(localFallback: Customer[]): Promise<Customer[]> {
  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) {
    return localFallback;
  }

  try {
    const { collection, getDocsFromServer, doc, setDoc } = await import('firebase/firestore');
    const snapshot = await getDocsFromServer(collection(db, 'customers'));
    
    if (snapshot.empty) {
      // Seed Firestore with initial customer ledger values if empty
      const seededCustomers: Customer[] = [];
      for (const customer of localFallback) {
        await setDoc(doc(db, 'customers', customer.id), customer);
        seededCustomers.push(customer);
      }
      return seededCustomers;
    }
    
    const customersList: Customer[] = [];
    snapshot.forEach(docRef => {
      customersList.push(docRef.data() as Customer);
    });
    return customersList;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'customers');
    return localFallback;
  }
}

// Save or Update a single Paper Stock in Firestore
export async function savePaperStockDoc(stock: PaperStock): Promise<void> {
  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'paperStocks', stock.id), stock);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `paperStocks/${stock.id}`);
  }
}

// Save or Update a single Customer Order in Firestore
export async function saveCustomerDoc(customer: Customer): Promise<void> {
  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'customers', customer.id), customer);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `customers/${customer.id}`);
  }
}

// Delete a Customer Order from Firestore
export async function deleteCustomerDoc(id: string): Promise<void> {
  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'customers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `customers/${id}`);
  }
}

// Fetch Bank Accounts with local fallback verification
export async function fetchAllBankAccounts(localFallback: BankAccount[]): Promise<BankAccount[]> {
  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) {
    return localFallback;
  }

  try {
    const { collection, getDocsFromServer, doc, setDoc } = await import('firebase/firestore');
    const snapshot = await getDocsFromServer(collection(db, 'bankAccounts'));
    
    if (snapshot.empty) {
      // Seed Firestore with initial bank accounts if empty
      const seededAccounts: BankAccount[] = [];
      for (const acct of localFallback) {
        await setDoc(doc(db, 'bankAccounts', acct.id), acct);
        seededAccounts.push(acct);
      }
      return seededAccounts;
    }
    
    const accounts: BankAccount[] = [];
    snapshot.forEach(docRef => {
      accounts.push(docRef.data() as BankAccount);
    });
    return accounts;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'bankAccounts');
    return localFallback;
  }
}

// Save or Update a single Bank Account in Firestore
export async function saveBankAccountDoc(account: BankAccount): Promise<void> {
  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'bankAccounts', account.id), account);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `bankAccounts/${account.id}`);
  }
}

// Delete a Bank Account from Firestore
export async function deleteBankAccountDoc(id: string): Promise<void> {
  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'bankAccounts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bankAccounts/${id}`);
  }
}
