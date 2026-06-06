import { getFirebaseDb, OperationType, handleFirestoreError } from './firebase';
import { supabase, isSupabaseConfigured, setSupabaseValidationError } from './supabase';
import { Customer, PaperStock, BankAccount, Purchase, ExpenseCategory } from '../types';

// ============================================
// 1. PAPER STOCKS OPERATIONS
// ============================================

export async function fetchAllPaperStocks(localFallback: PaperStock[]): Promise<PaperStock[]> {
  // Try Supabase first
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('paper_stocks')
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed Supabase if empty
        const { error: seedError } = await supabase
          .from('paper_stocks')
          .insert(localFallback);
        if (seedError) {
          console.error("Supabase paper_stocks seeding error: ", seedError);
          setSupabaseValidationError(`Seeding paper_stocks failed: ${seedError.message}. Did you run the SQL bootstrapping script and disable RLS?`);
        }
        return localFallback;
      }
      return data as PaperStock[];
    } catch (err: any) {
      console.error("Supabase fetchAllPaperStocks failed, falling back:", err);
      setSupabaseValidationError(`Database Query Error: ${err?.message || String(err)}. Check if you pasted and executed the bootstrapping script in your Supabase SQL Editor.`);
    }
  }

  // Try Firebase second
  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) {
    return localFallback;
  }

  try {
    const { collection, getDocsFromServer, doc, setDoc } = await import('firebase/firestore');
    const snapshot = await getDocsFromServer(collection(db, 'paperStocks'));
    
    if (snapshot.empty) {
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

export async function savePaperStockDoc(stock: PaperStock): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('paper_stocks')
        .upsert(stock);
      if (error) throw error;
      return;
    } catch (err) {
      console.error("Supabase savePaperStockDoc failed:", err);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'paperStocks', stock.id), stock);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `paperStocks/${stock.id}`);
  }
}

export async function deletePaperStockDoc(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('paper_stocks')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.error("Supabase deletePaperStockDoc failed:", err);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'paperStocks', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `paperStocks/${id}`);
  }
}


// ============================================
// 2. CUSTOMERS OPERATIONS
// ============================================

export async function fetchAllCustomers(localFallback: Customer[]): Promise<Customer[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed Supabase if empty
        const { error: seedError } = await supabase
          .from('customers')
          .insert(localFallback);
        if (seedError) {
          console.error("Supabase customers seeding error: ", seedError);
          setSupabaseValidationError(`Seeding customers failed: ${seedError.message}`);
        }
        return localFallback;
      }
      return data as Customer[];
    } catch (err: any) {
      console.error("Supabase fetchAllCustomers failed, falling back:", err);
      setSupabaseValidationError(`Database Query Error: ${err?.message || String(err)}`);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) {
    return localFallback;
  }

  try {
    const { collection, getDocsFromServer, doc, setDoc } = await import('firebase/firestore');
    const snapshot = await getDocsFromServer(collection(db, 'customers'));
    
    if (snapshot.empty) {
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

export async function saveCustomerDoc(customer: Customer): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('customers')
        .upsert(customer);
      if (error) throw error;
      return;
    } catch (err) {
      console.error("Supabase saveCustomerDoc failed:", err);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'customers', customer.id), customer);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `customers/${customer.id}`);
  }
}

export async function deleteCustomerDoc(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.error("Supabase deleteCustomerDoc failed:", err);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'customers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `customers/${id}`);
  }
}


// ============================================
// 3. BANK ACCOUNTS OPERATIONS
// ============================================

export async function fetchAllBankAccounts(localFallback: BankAccount[]): Promise<BankAccount[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed Supabase if empty
        const { error: seedError } = await supabase
          .from('bank_accounts')
          .insert(localFallback);
        if (seedError) {
          console.error("Supabase bank_accounts seeding error: ", seedError);
          setSupabaseValidationError(`Seeding bank_accounts failed: ${seedError.message}`);
        }
        return localFallback;
      }
      return data as BankAccount[];
    } catch (err: any) {
      console.error("Supabase fetchAllBankAccounts failed, falling back:", err);
      setSupabaseValidationError(`Database Query Error: ${err?.message || String(err)}`);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) {
    return localFallback;
  }

  try {
    const { collection, getDocsFromServer, doc, setDoc } = await import('firebase/firestore');
    const snapshot = await getDocsFromServer(collection(db, 'bankAccounts'));
    
    if (snapshot.empty) {
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

export async function saveBankAccountDoc(account: BankAccount): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .upsert(account);
      if (error) throw error;
      return;
    } catch (err) {
      console.error("Supabase saveBankAccountDoc failed:", err);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'bankAccounts', account.id), account);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `bankAccounts/${account.id}`);
  }
}

export async function deleteBankAccountDoc(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.error("Supabase deleteBankAccountDoc failed:", err);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'bankAccounts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `bankAccounts/${id}`);
  }
}


// ============================================
// 4. PURCHASES OPERATIONS
// ============================================

export async function fetchAllPurchases(localFallback: Purchase[]): Promise<Purchase[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed Supabase if empty
        const { error: seedError } = await supabase
          .from('purchases')
          .insert(localFallback);
        if (seedError) {
          console.error("Supabase purchases seeding error: ", seedError);
          setSupabaseValidationError(`Seeding purchases failed: ${seedError.message}`);
        }
        return localFallback;
      }
      return data as Purchase[];
    } catch (err: any) {
      console.error("Supabase fetchAllPurchases failed, falling back:", err);
      setSupabaseValidationError(`Database Query Error: ${err?.message || String(err)}`);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) {
    return localFallback;
  }

  try {
    const { collection, getDocsFromServer, doc, setDoc } = await import('firebase/firestore');
    const snapshot = await getDocsFromServer(collection(db, 'purchases'));
    
    if (snapshot.empty) {
      const seededPurchases: Purchase[] = [];
      for (const p of localFallback) {
        await setDoc(doc(db, 'purchases', p.id), p);
        seededPurchases.push(p);
      }
      return seededPurchases;
    }
    
    const purchases: Purchase[] = [];
    snapshot.forEach(docRef => {
      purchases.push(docRef.data() as Purchase);
    });
    return purchases;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'purchases');
    return localFallback;
  }
}

export async function savePurchaseDoc(purchase: Purchase): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('purchases')
        .upsert(purchase);
      if (error) throw error;
      return;
    } catch (err) {
      console.error("Supabase savePurchaseDoc failed:", err);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'purchases', purchase.id), purchase);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `purchases/${purchase.id}`);
  }
}

export async function deletePurchaseDoc(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return;
    } catch (err) {
      console.error("Supabase deletePurchaseDoc failed:", err);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'purchases', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `purchases/${id}`);
  }
}


// ============================================
// 5. EXPENSE CATEGORIES OPERATIONS
// ============================================

export async function fetchAllExpenseCategories(localFallback: ExpenseCategory[]): Promise<ExpenseCategory[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*');

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed Supabase if empty
        const { error: seedError } = await supabase
          .from('expense_categories')
          .insert(localFallback);
        if (seedError) {
          console.error("Supabase expense_categories seeding error: ", seedError);
          setSupabaseValidationError(`Seeding expense_categories failed: ${seedError.message}`);
        }
        return localFallback;
      }
      return data as ExpenseCategory[];
    } catch (err: any) {
      console.error("Supabase fetchAllExpenseCategories failed, falling back:", err);
      setSupabaseValidationError(`Database Query Error: ${err?.message || String(err)}`);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) {
    return localFallback;
  }

  try {
    const { collection, getDocsFromServer, doc, setDoc } = await import('firebase/firestore');
    const snapshot = await getDocsFromServer(collection(db, 'expenseCategories'));
    
    if (snapshot.empty) {
      const seededCategories: ExpenseCategory[] = [];
      for (const cat of localFallback) {
        await setDoc(doc(db, 'expenseCategories', cat.id), cat);
        seededCategories.push(cat);
      }
      return seededCategories;
    }
    
    const categories: ExpenseCategory[] = [];
    snapshot.forEach(docRef => {
      categories.push(docRef.data() as ExpenseCategory);
    });
    return categories;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'expenseCategories');
    return localFallback;
  }
}

export async function saveExpenseCategoryDoc(cat: ExpenseCategory): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('expense_categories')
        .upsert(cat);
      if (error) throw error;
      return;
    } catch (err) {
      console.error("Supabase saveExpenseCategoryDoc failed:", err);
    }
  }

  const { db, isFirebaseConfigured } = await getFirebaseDb();
  if (!isFirebaseConfigured) return;
  
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'expenseCategories', cat.id), cat);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `expenseCategories/${cat.id}`);
  }
}
