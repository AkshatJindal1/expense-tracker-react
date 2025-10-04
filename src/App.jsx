import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from './firebase.js';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  limit,
  writeBatch,
  runTransaction,
  increment,
  getDoc,
} from 'firebase/firestore';

// Component Imports
import { LoginPage } from './pages/LoginPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { BottomNav } from './components/BottomNav.jsx';
import { AddTransactionPage } from './pages/AddTransactionPage.jsx';
import { SelectionSheet } from './components/SelectionSheet.jsx';
import { AllTransactionsPage } from './pages/AllTransactionsPage.jsx';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { MorePage } from './pages/MorePage.jsx';
import { AdjustmentPage } from './pages/AdjustmentPage.jsx';
import { AccountsPage } from './pages/AccountsPage.jsx';
import { CategoriesPage } from './pages/CategoriesPage.jsx';
import { AddAccountPage } from './pages/AddAccountPage.jsx';
import { AddCategoryPage } from './pages/AddCategoryPage.jsx';
import { ConfirmationModal } from './components/ConfirmationModal.jsx';
import { Spinner } from './components/Spinner.jsx';
import { ErrorSnackbar } from './components/ErrorSnackbar.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Data states
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sheetConfig, setSheetConfig] = useState({ isOpen: false });
  const [confirmationConfig, setConfirmationConfig] = useState({
    isOpen: false,
  });
  const [confirmCallback, setConfirmCallback] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // --- Auth & Data Effects ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      if (!currentUser) {
        navigate('/'); // Redirect to login page if not authenticated
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setAccounts([]);
      setCategories([]);
      return;
    }
    const txQuery = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc'),
      limit(10)
    );
    const txUnsub = onSnapshot(txQuery, (snapshot) =>
      setTransactions(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
    const accQuery = query(
      collection(db, 'users', user.uid, 'accounts'),
      orderBy('name')
    );
    const accUnsub = onSnapshot(accQuery, (snapshot) =>
      setAccounts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    const catQuery = query(collection(db, 'users', user.uid, 'categories'));
    const catUnsub = onSnapshot(catQuery, (snapshot) =>
      setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
    );
    return () => {
      txUnsub();
      accUnsub();
      catUnsub();
    };
  }, [user]);

  const showError = (message) => {
    setError(message);
  };

  const clearError = () => {
    setError('');
  };

  // --- Custom Back Navigation Logic ---
  const handleBack = () => {
    const bottomNavPaths = ['/transactions', '/analytics', '/more'];
    const currentPath = location.pathname;

    if (bottomNavPaths.includes(currentPath)) {
      navigate('/');
    } else {
      navigate(-1); // Standard browser back behavior
    }
  };

  // --- Data Handling ---

  const openSelectionSheet = (title, items, currentValue, onSelect) => {
    setSheetConfig({ isOpen: true, title, items, currentValue, onSelect });
  };

  const closeSelectionSheet = () => {
    setSheetConfig({ isOpen: false });
  };

  const showConfirmation = ({ title, message, confirmText, onConfirm }) => {
    setConfirmationConfig({ isOpen: true, title, message, confirmText });
    setConfirmCallback(() => onConfirm);
  };

  const handleConfirm = () => {
    if (confirmCallback) confirmCallback();
    setConfirmationConfig({ isOpen: false });
    setConfirmCallback(null);
  };

  const handleCancelConfirm = () => {
    setConfirmationConfig({ isOpen: false });
    setConfirmCallback(null);
  };

  const handleSaveAccount = async (accountData) => {
    const { id, ...data } = accountData;
    const collectionRef = collection(db, 'users', user.uid, 'accounts');
    if (id) {
      await updateDoc(doc(collectionRef, id), data);
    } else {
      await addDoc(collectionRef, data);
    }
    handleBack();
  };

  const performDeleteAccounts = async (ids) => {
    const promises = ids.map((id) =>
      deleteDoc(doc(db, 'users', user.uid, 'accounts', id))
    );
    await Promise.all(promises);
  };

  const handleSaveCategory = async (categoryData) => {
    const { id, ...data } = categoryData;
    const collectionRef = collection(db, 'users', user.uid, 'categories');
    if (id) {
      await updateDoc(doc(collectionRef, id), data);
    } else {
      await addDoc(collectionRef, data);
    }
    handleBack();
  };

  const performDeleteCategories = async (ids) => {
    const promises = ids.map((id) =>
      deleteDoc(doc(db, 'users', user.uid, 'categories', id))
    );
    await Promise.all(promises);
  };

  const handleSignIn = () => {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(console.error);
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleSaveTransaction = async (transactionData) => {
    const { id, ...data } = transactionData;
    const amount = data.amount || 0;
    const splitAmount = data.splitAmount || 0;
    const expenseAmount =
      data.type === 'Expense' ? amount - splitAmount : amount;
    const date = data.date; //.toDate();
    const monthId = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayId = `${monthId}-${String(date.getDate()).padStart(2, '0')}`;

    const involved = [];
    if (data.type === 'Expense' && data.source) involved.push(data.source);
    if (data.type === 'Income' && data.destination)
      involved.push(data.destination);
    if (data.type === 'Transfer') {
      if (data.source) involved.push(data.source);
      if (data.destination) involved.push(data.destination);
    }
    const finalData = { ...data, involvedAccounts: involved };

    const accountsRef = collection(db, 'users', user.uid, 'accounts');
    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    const monthlyAnalyticsRef = doc(
      db,
      `analytics/${user.uid}/monthly/${monthId}`
    );
    const dailyAnalyticsRef = doc(db, `analytics/${user.uid}/daily/${dayId}`);

    try {
      if (id) {
        // --- UPDATE ---
        await runTransaction(db, async (firestoreTransaction) => {
          const txDocRef = doc(transactionsRef, id);
          const txDoc = await firestoreTransaction.get(txDocRef);
          if (!txDoc.exists()) throw 'Transaction does not exist!';

          const before = txDoc.data();
          const oldAmount = before.amount || 0;
          const oldSplitAmount = before.splitAmount || 0;
          const oldExpenseAmount =
            before.type === 'Expense' ? oldAmount - oldSplitAmount : oldAmount;
          const oldDate = before.date.toDate();
          const oldMonthId = `${oldDate.getFullYear()}-${String(oldDate.getMonth() + 1).padStart(2, '0')}`;
          const oldDayId = `${oldMonthId}-${String(oldDate.getDate()).padStart(2, '0')}`;
          const oldMonthlyRef = doc(
            db,
            `analytics/${user.uid}/monthly/${oldMonthId}`
          );
          const oldDailyRef = doc(
            db,
            `analytics/${user.uid}/daily/${oldDayId}`
          );
          const oldSourceAccount = accounts.find(
            (a) => a.name === before.source
          );
          const oldDestAccount = accounts.find(
            (a) => a.name === before.destination
          );

          // 1. Revert old transaction
          if (before.type === 'Expense') {
            if (oldSourceAccount)
              firestoreTransaction.update(
                doc(accountsRef, oldSourceAccount.id),
                {
                  balance: increment(oldAmount),
                }
              );
            if (oldSplitAmount > 0) {
              const splitwiseAccount = accounts.find(
                (a) => a.type === 'Splitwise'
              );
              if (splitwiseAccount)
                firestoreTransaction.update(
                  doc(accountsRef, splitwiseAccount.id),
                  { balance: increment(-oldSplitAmount) }
                );
            }
            firestoreTransaction.set(
              oldMonthlyRef,
              {
                totalExpense: increment(-oldExpenseAmount),
                expenseCategoryTotals: {
                  [before.category]: increment(-oldExpenseAmount),
                },
              },
              { merge: true }
            );
            firestoreTransaction.set(
              oldDailyRef,
              {
                totalExpense: increment(-oldExpenseAmount),
                expenseCategoryTotals: {
                  [before.category]: increment(-oldExpenseAmount),
                },
              },
              { merge: true }
            );
          } else if (before.type === 'Income') {
            if (oldDestAccount)
              firestoreTransaction.update(doc(accountsRef, oldDestAccount.id), {
                balance: increment(-oldAmount),
              });
            firestoreTransaction.set(
              oldMonthlyRef,
              {
                totalIncome: increment(-oldAmount),
                incomeCategoryTotals: {
                  [before.category]: increment(-oldAmount),
                },
              },
              { merge: true }
            );
            firestoreTransaction.set(
              oldDailyRef,
              {
                totalIncome: increment(-oldAmount),
                incomeCategoryTotals: {
                  [before.category]: increment(-oldAmount),
                },
              },
              { merge: true }
            );
          } else if (before.type === 'Transfer') {
            if (oldSourceAccount)
              firestoreTransaction.update(
                doc(accountsRef, oldSourceAccount.id),
                {
                  balance: increment(oldAmount),
                }
              );
            if (oldDestAccount)
              firestoreTransaction.update(doc(accountsRef, oldDestAccount.id), {
                balance: increment(-oldAmount),
              });
            firestoreTransaction.set(
              oldMonthlyRef,
              {
                transferCategoryTotals: {
                  [before.category]: increment(-oldAmount),
                },
              },
              { merge: true }
            );
            firestoreTransaction.set(
              oldDailyRef,
              {
                transferCategoryTotals: {
                  [before.category]: increment(-oldAmount),
                },
              },
              { merge: true }
            );
            // Transfers may not affect analytics
          }

          // 2. Apply new transaction
          const newSourceAccount = accounts.find(
            (a) => a.name === finalData.source
          );
          const newDestAccount = accounts.find(
            (a) => a.name === finalData.destination
          );
          if (finalData.type === 'Expense') {
            if (newSourceAccount)
              firestoreTransaction.update(
                doc(accountsRef, newSourceAccount.id),
                {
                  balance: increment(-amount),
                }
              );
            if (splitAmount > 0) {
              const splitwiseAccount = accounts.find(
                (a) => a.type === 'Splitwise'
              );
              if (splitwiseAccount)
                firestoreTransaction.update(
                  doc(accountsRef, splitwiseAccount.id),
                  { balance: increment(splitAmount) }
                );
            }
            firestoreTransaction.set(
              monthlyAnalyticsRef,
              {
                totalExpense: increment(expenseAmount),
                expenseCategoryTotals: {
                  [finalData.category]: increment(expenseAmount),
                },
              },
              { merge: true }
            );
            firestoreTransaction.set(
              dailyAnalyticsRef,
              {
                totalExpense: increment(expenseAmount),
                expenseCategoryTotals: {
                  [finalData.category]: increment(expenseAmount),
                },
              },
              { merge: true }
            );
          } else if (finalData.type === 'Income') {
            if (newDestAccount)
              firestoreTransaction.update(doc(accountsRef, newDestAccount.id), {
                balance: increment(amount),
              });
            firestoreTransaction.set(
              monthlyAnalyticsRef,
              {
                totalIncome: increment(amount),
                incomeCategoryTotals: {
                  [finalData.category]: increment(amount),
                },
              },
              { merge: true }
            );
            firestoreTransaction.set(
              dailyAnalyticsRef,
              {
                totalIncome: increment(amount),
                incomeCategoryTotals: {
                  [finalData.category]: increment(amount),
                },
              },
              { merge: true }
            );
          } else if (finalData.type === 'Transfer') {
            if (newSourceAccount)
              firestoreTransaction.update(
                doc(accountsRef, newSourceAccount.id),
                {
                  balance: increment(-amount),
                }
              );
            if (newDestAccount)
              firestoreTransaction.update(doc(accountsRef, newDestAccount.id), {
                balance: increment(amount),
              });
            firestoreTransaction.set(
              monthlyAnalyticsRef,
              {
                transferCategoryTotals: {
                  [before.category]: increment(oldAmount),
                },
              },
              { merge: true }
            );
            firestoreTransaction.set(
              dailyAnalyticsRef,
              {
                transferCategoryTotals: {
                  [before.category]: increment(oldAmount),
                },
              },
              { merge: true }
            );
          }

          // 3. Update the transaction itself
          firestoreTransaction.update(txDocRef, finalData);
        });
        handleBack();
      } else {
        // --- CREATE ---
        const batch = writeBatch(db);
        batch.set(doc(transactionsRef), finalData);

        const sourceAccount = accounts.find((a) => a.name === finalData.source);
        const destAccount = accounts.find(
          (a) => a.name === finalData.destination
        );

        if (finalData.type === 'Expense') {
          if (sourceAccount)
            batch.update(doc(accountsRef, sourceAccount.id), {
              balance: increment(-amount),
            });
          if (splitAmount > 0) {
            const splitwiseAccount = accounts.find(
              (a) => a.type === 'Splitwise'
            );
            if (splitwiseAccount)
              batch.update(doc(accountsRef, splitwiseAccount.id), {
                balance: increment(splitAmount),
              });
          }
          batch.set(
            monthlyAnalyticsRef,
            {
              totalExpense: increment(expenseAmount),
              numExpenseTransactions: increment(1),
              expenseCategoryTotals: {
                [finalData.category]: increment(expenseAmount),
              },
            },
            { merge: true }
          );
          batch.set(
            dailyAnalyticsRef,
            {
              totalExpense: increment(expenseAmount),
              numExpenseTransactions: increment(1),
              expenseCategoryTotals: {
                [finalData.category]: increment(expenseAmount),
              },
            },
            { merge: true }
          );
        } else if (finalData.type === 'Income') {
          if (destAccount)
            batch.update(doc(accountsRef, destAccount.id), {
              balance: increment(amount),
            });
          batch.set(
            monthlyAnalyticsRef,
            {
              totalIncome: increment(amount),
              numIncomeTransactions: increment(1),
              incomeCategoryTotals: { [finalData.category]: increment(amount) },
            },
            { merge: true }
          );
          batch.set(
            dailyAnalyticsRef,
            {
              totalIncome: increment(amount),
              numIncomeTransactions: increment(1),
              incomeCategoryTotals: { [finalData.category]: increment(amount) },
            },
            { merge: true }
          );
        } else if (finalData.type === 'Transfer') {
          if (sourceAccount)
            batch.update(doc(accountsRef, sourceAccount.id), {
              balance: increment(-amount),
            });
          if (destAccount)
            batch.update(doc(accountsRef, destAccount.id), {
              balance: increment(amount),
            });
          batch.set(
            monthlyAnalyticsRef,
            {
              numTransferTransactions: increment(1),
              transferCategoryTotals: {
                [finalData.category]: increment(amount),
              },
            },
            { merge: true }
          );
          batch.set(
            dailyAnalyticsRef,
            {
              numTransferTransactions: increment(1),
              transferCategoryTotals: {
                [finalData.category]: increment(amount),
              },
            },
            { merge: true }
          );
        }

        await batch.commit();
        navigate('/transactions');
      }
    } catch (error) {
      console.error('Transaction save failed: ', error);
      showError('Failed to save transaction. Please try again.');
      throw error;
    }
  };

  const performDeleteTransactions = async (ids) => {
    const batch = writeBatch(db);
    const accountsRef = collection(db, 'users', user.uid, 'accounts');

    for (const id of ids) {
      const txRef = doc(db, 'users', user.uid, 'transactions', id);
      const txDoc = await getDoc(txRef);
      if (txDoc.exists()) {
        const transaction = txDoc.data();
        const amount = transaction.amount || 0;
        const splitAmount = transaction.splitAmount || 0;
        const expenseAmount =
          transaction.type === 'Expense' ? amount - splitAmount : amount;
        const date = transaction.date.toDate();
        const monthId = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const dayId = `${monthId}-${String(date.getDate()).padStart(2, '0')}`;
        const monthlyAnalyticsRef = doc(
          db,
          `analytics/${user.uid}/monthly/${monthId}`
        );
        const dailyAnalyticsRef = doc(
          db,
          `analytics/${user.uid}/daily/${dayId}`
        );
        const sourceAccount = accounts.find(
          (a) => a.name === transaction.source
        );
        const destAccount = accounts.find(
          (a) => a.name === transaction.destination
        );

        batch.delete(txRef);

        if (transaction.type === 'Expense') {
          if (sourceAccount)
            batch.update(doc(accountsRef, sourceAccount.id), {
              balance: increment(amount),
            });
          if (splitAmount > 0) {
            const splitwiseAccount = accounts.find(
              (a) => a.type === 'Splitwise'
            );
            if (splitwiseAccount)
              batch.update(doc(accountsRef, splitwiseAccount.id), {
                balance: increment(-splitAmount),
              });
          }
          batch.set(
            monthlyAnalyticsRef,
            {
              totalExpense: increment(-expenseAmount),
              numExpenseTransactions: increment(-1),
              expenseCategoryTotals: {
                [transaction.category]: increment(-expenseAmount),
              },
            },
            { merge: true }
          );
          batch.set(
            dailyAnalyticsRef,
            {
              totalExpense: increment(-expenseAmount),
              numExpenseTransactions: increment(-1),
              expenseCategoryTotals: {
                [transaction.category]: increment(-expenseAmount),
              },
            },
            { merge: true }
          );
        } else if (transaction.type === 'Income') {
          if (destAccount)
            batch.update(doc(accountsRef, destAccount.id), {
              balance: increment(-amount),
            });
          batch.set(
            monthlyAnalyticsRef,
            {
              totalIncome: increment(-amount),
              numIncomeTransactions: increment(-1),
              incomeCategoryTotals: {
                [transaction.category]: increment(-amount),
              },
            },
            { merge: true }
          );
          batch.set(
            dailyAnalyticsRef,
            {
              totalIncome: increment(-amount),
              numIncomeTransactions: increment(-1),
              incomeCategoryTotals: {
                [transaction.category]: increment(-amount),
              },
            },
            { merge: true }
          );
        } else if (transaction.type === 'Transfer') {
          if (sourceAccount)
            batch.update(doc(accountsRef, sourceAccount.id), {
              balance: increment(amount),
            });
          if (destAccount)
            batch.update(doc(accountsRef, destAccount.id), {
              balance: increment(-amount),
            });
          batch.set(
            monthlyAnalyticsRef,
            {
              numTransferTransactions: increment(-1),
              transferCategoryTotals: {
                [transaction.category]: increment(-amount),
              },
            },
            { merge: true }
          );
          batch.set(
            dailyAnalyticsRef,
            {
              numTransferTransactions: increment(-1),
              transferCategoryTotals: {
                [transaction.category]: increment(-amount),
              },
            },
            { merge: true }
          );
        }
      }
    }
    await batch.commit();
  };

  const handleSaveAdjustment = async (accountName, difference) => {
    if (!user) return;
    const accountDoc = accounts.find((a) => a.name === accountName);
    if (!accountDoc) return;
    const adjTx = {
      type: difference > 0 ? 'Income' : 'Expense',
      amount: Math.abs(difference),
      category: difference > 0 ? 'Income Adjustment' : 'Expense Adjustment',
      source: difference > 0 ? null : accountName,
      destination: difference > 0 ? accountName : null,
      notes: `Balance adjustment for ${accountName}.`,
      splitAmount: 0,
      date: new Date(),
      involvedAccounts: [accountName],
    };

    await handleSaveTransaction(adjTx);
    handleBack();
  };

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <LoginPage onSignIn={handleSignIn} />;
  }

  const bottomNavPaths = ['/', '/transactions', '/analytics', '/more'];
  const showBottomNav = bottomNavPaths.includes(location.pathname);

  return (
    <div>
      <div className="pb-20">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                user={user}
                transactions={transactions}
                accounts={accounts}
                onNavigate={(path) => navigate(path)}
                onEditTxn={(item) =>
                  navigate('/add-transaction', { state: { initialData: item } })
                }
                showError={showError}
              />
            }
          />
          <Route
            path="/add-transaction"
            element={
              <AddTransactionPage
                onSave={handleSaveTransaction}
                onBack={handleBack}
                onDelete={(id) =>
                  showConfirmation({
                    title: 'Delete Transaction?',
                    message: 'This cannot be undone.',
                    confirmText: 'Delete',
                    onConfirm: async () => {
                      await performDeleteTransactions([id]);
                      handleBack();
                    },
                  })
                }
                accounts={accounts}
                categories={categories}
                openSelectionSheet={openSelectionSheet}
                showError={showError}
              />
            }
          />
          <Route
            path="/transactions"
            element={
              <AllTransactionsPage
                user={user}
                db={db}
                onEdit={(item) =>
                  navigate('/add-transaction', { state: { initialData: item } })
                }
                onDelete={(ids) =>
                  showConfirmation({
                    title: `Delete ${ids.length} Transaction(s)?`,
                    message: 'This cannot be undone.',
                    confirmText: 'Delete',
                    onConfirm: () => performDeleteTransactions(ids),
                  })
                }
                accounts={accounts}
                openSelectionSheet={openSelectionSheet}
                showError={showError}
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <AnalyticsPage
                user={user}
                transactions={transactions}
                onBack={handleBack}
                showError={showError}
              />
            }
          />
          <Route
            path="/more"
            element={<MorePage onSignOut={handleSignOut} />}
            showError={showError}
          />
          <Route
            path="/accounts"
            element={
              <AccountsPage
                accounts={accounts}
                onBack={handleBack}
                onAddNew={() => navigate('/add-account')}
                onEdit={(item) =>
                  navigate('/add-account', { state: { initialData: item } })
                }
                onDelete={(ids) =>
                  showConfirmation({
                    title: `Delete ${ids.length} Account(s)?`,
                    message:
                      'This may affect existing transactions. This action cannot be undone.',
                    confirmText: 'Delete',
                    onConfirm: () => performDeleteAccounts(ids),
                  })
                }
              />
            }
          />
          <Route
            path="/add-account"
            element={
              <AddAccountPage
                onSave={handleSaveAccount}
                onBack={handleBack}
                onDelete={(id) =>
                  showConfirmation({
                    title: 'Delete Account?',
                    message:
                      'Are you sure you want to delete this account? This action cannot be undone.',
                    confirmText: 'Delete',
                    onConfirm: async () => {
                      await performDeleteAccounts([id]);
                      handleBack();
                    },
                  })
                }
                openSelectionSheet={openSelectionSheet}
                showError={showError}
              />
            }
          />
          <Route
            path="/categories"
            element={
              <CategoriesPage
                categories={categories}
                onBack={handleBack}
                onAddNew={() => navigate('/add-category')}
                onEdit={(item) =>
                  navigate('/add-category', { state: { initialData: item } })
                }
                onDelete={(ids) =>
                  showConfirmation({
                    title: `Delete ${ids.length} Category(s)?`,
                    message:
                      'This will not delete existing transactions with this category. Are you sure?',
                    confirmText: 'Delete',
                    onConfirm: () => performDeleteCategories(ids),
                  })
                }
              />
            }
          />
          <Route
            path="/add-category"
            element={
              <AddCategoryPage
                onSave={handleSaveCategory}
                onBack={handleBack}
                onDelete={(id) =>
                  showConfirmation({
                    title: 'Delete Category?',
                    message: 'Are you sure?',
                    confirmText: 'Delete',
                    onConfirm: async () => {
                      await performDeleteCategories([id]);
                      handleBack();
                    },
                  })
                }
                openSelectionSheet={openSelectionSheet}
                showError={showError}
              />
            }
          />
          <Route
            path="/adjustment"
            element={
              <AdjustmentPage
                onBack={handleBack}
                onSave={handleSaveAdjustment}
                accounts={accounts}
                openSelectionSheet={openSelectionSheet}
              />
            }
          />
        </Routes>
        {showBottomNav && (
          <BottomNav onAddTransaction={() => navigate('/add-transaction')} />
        )}
      </div>
      <SelectionSheet config={sheetConfig} onClose={closeSelectionSheet} />
      <ConfirmationModal
        config={confirmationConfig}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
      <ErrorSnackbar message={error} onClear={clearError} />
    </div>
  );
}

export default App;
