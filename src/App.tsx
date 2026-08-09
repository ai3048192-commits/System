import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Receipt,
  Truck,
  TrendingUp,
  Trash2,
  Edit3,
  Calendar,
  Printer,
  Plus,
  RefreshCw,
  BookOpen,
  X,
  Check,
  UserCheck,
  BarChart3,
  Wallet,
  Database,
  FileText,
  Clock,
  Layers,
  Archive
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function StoreSystemMaster() {
  const getDateTimeFormatted = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeStr = now.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} - ${timeStr}`;
  };

  const extractMonthFromDate = (dateStr) => {
    try {
      if (!dateStr)
        return new Date().toLocaleDateString("ar-EG", {
          month: "long",
          year: "numeric",
        });
      const parts = dateStr.trim().split("-");
      const mainDate = parts[0] ? parts[0].trim() : dateStr;
      const dateParts = mainDate.split(" ");
      if (dateParts.length >= 3) {
        return `${dateParts[1]} ${dateParts[2]}`;
      }
      return new Date().toLocaleDateString("ar-EG", {
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return new Date().toLocaleDateString("ar-EG", {
        month: "long",
        year: "numeric",
      });
    }
  };

  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDbSynced, setIsDbSynced] = useState(false);

  const [saleAmount, setSaleAmount] = useState("");
  const [saleNote, setSaleNote] = useState("");
  const [saleDateInput, setSaleDateInput] = useState(getDateTimeFormatted());

  const [supAmount, setSupAmount] = useState("");
  const [supName, setSupName] = useState("");
  const [supDirection, setSupDirection] = useState("out");
  const [supDateInput, setSupDateInput] = useState(getDateTimeFormatted());

  const [expAmount, setExpAmount] = useState("");
  const [expTypeInput, setExpTypeInput] = useState("");
  const [isEmployeeAdvance, setIsEmployeeAdvance] = useState(false);
  const [expenseEmpName, setExpenseEmpName] = useState("محمد");
  const [expDateInput, setExpDateInput] = useState(getDateTimeFormatted());

  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [selectedArchiveMonth, setSelectedArchiveMonth] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editTypeInput, setEditTypeInput] = useState("");

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printOption, setPrintOption] = useState("full_summary");
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState(null);
  const [selectedSupplierForPrint, setSelectedSupplierForPrint] = useState("");

  const MOHAMED_SALARY = 7000;
  const ESMAIL_SALARY = 6000;

  useEffect(() => {
    fetchDataFromApi();
  }, []);

  const fetchDataFromApi = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions`);
      if (!response.ok) throw new Error("API not available");
      const data = await response.json();
      setTransactions(data);
      setIsDbSynced(true);
    } catch (error) {
      setIsDbSynced(false);
    }
  };

  const saveToApi = async (actionType, payload = {}) => {
    try {
      let response;
      if (actionType === "add") {
        response = await fetch(`${API_URL}/transactions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (actionType === "delete") {
        response = await fetch(`${API_URL}/transactions/${payload.id}`, {
          method: "DELETE",
        });
      } else if (actionType === "update") {
        response = await fetch(`${API_URL}/transactions/${payload.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      
      if (response && response.ok) {
        setIsDbSynced(true);
        fetchDataFromApi();
      } else {
        setIsDbSynced(false);
      }
    } catch (error) {
      setIsDbSynced(false);
    }
  };

  const handleAdd = async (type) => {
    let amount = 0,
      desc = "",
      subtype = "",
      empName = "",
      customDate = getDateTimeFormatted();

    if (type === "sale") {
      amount = parseFloat(saleAmount);
      desc = saleNote ? `ملاحظة: ${saleNote}` : "مبيعات محل الأخوة";
      customDate = saleDateInput || getDateTimeFormatted();
      if (!amount || amount <= 0) return alert("أدخل مبلغ المبيعات الصحيح");
      setSaleAmount("");
      setSaleNote("");
      setSaleDateInput(getDateTimeFormatted());
    } else if (type === "supplier") {
      amount = parseFloat(supAmount);
      desc = supName.trim();
      customDate = supDateInput || getDateTimeFormatted();
      if (!amount || amount <= 0 || !desc)
        return alert("أدخل اسم المورد ومبلغ الحركة بشكل صحيح");
      if (supDirection === "in") type = "supplier_in";
      setSupAmount("");
      setSupName("");
      setSupDateInput(getDateTimeFormatted());
    } else if (type === "expense") {
      amount = parseFloat(expAmount);
      subtype = expTypeInput.trim() || "مصروف عام";
      desc = subtype;
      customDate = expDateInput || getDateTimeFormatted();

      if (!amount || amount <= 0) return alert("أدخل المبلغ الصحيح للمصروف");

      if (isEmployeeAdvance) {
        empName = expenseEmpName;
      }

      setExpAmount("");
      setExpTypeInput("");
      setIsEmployeeAdvance(false);
      setExpDateInput(getDateTimeFormatted());
    }

    const month = extractMonthFromDate(customDate);

    const newItem = {
      id: Date.now(),
      date: customDate,
      month,
      type:
        type === "supplier_in"
          ? "supplier_in"
          : type === "supplier"
            ? "supplier"
            : type === "sale"
              ? "sale"
              : "expense",
      amount,
      desc,
      subtype,
      isEmp: isEmployeeAdvance,
      empName,
    };

    await saveToApi("add", newItem);
  };

  const handleDelete = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا الكارت من قاعدة البيانات؟")) {
      await saveToApi("delete", { id });
    }
  };

  const startEditing = (t) => {
    setEditingId(t.id);
    setEditDate(t.date);
    setEditAmount(t.amount);
    setEditTypeInput(t.subtype || t.desc || "");
  };

  const saveEdit = async (id) => {
    const targetItem = transactions.find((t) => t.id === id);
    if (!targetItem) return;

    const newDate = editDate || targetItem.date;
    const newMonth = extractMonthFromDate(newDate);
    const updatedItem = {
      ...targetItem,
      date: newDate,
      month: newMonth,
      amount: parseFloat(editAmount) || targetItem.amount,
      desc: editTypeInput || targetItem.desc,
      subtype: editTypeInput || targetItem.subtype,
    };

    await saveToApi("update", updatedItem);
    setEditingId(null);
  };

  let totalIncome = 0,
    totalOut = 0;
  transactions.forEach((t) => {
    const val = parseFloat(t.amount) || 0;
    if (t.type === "sale" || t.type === "supplier_in") totalIncome += val;
    else totalOut += val;
  });
  const netProfit = totalIncome - totalOut;

  const supplierNamesList = [
    ...new Set(
      transactions
        .filter((t) => t.type === "supplier" || t.type === "supplier_in")
        .map((t) => t.desc),
    ),
  ];
  
  const suppliersSummary = supplierNamesList.map((name) => {
    const totalBought = transactions
      .filter((t) => t.type === "supplier" && t.desc === name)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const totalPaidOrReturned = transactions
      .filter((t) => t.type === "supplier_in" && t.desc === name)
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const netBalance = totalBought - totalPaidOrReturned;
    return { name, totalBought, totalPaidOrReturned, netBalance };
  });

  const monthsList = [...new Set(transactions.map((t) => t.month))];
  const monthlyStats = monthsList.map((monthName) => {
    const monthTransactions = transactions.filter((t) => t.month === monthName);
    const salesTotal = monthTransactions
      .filter((t) => t.type === "sale")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const expensesTotal = monthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const suppliersBoughtTotal = monthTransactions
      .filter((t) => t.type === "supplier")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const suppliersPaidTotal = monthTransactions
      .filter((t) => t.type === "supplier_in")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const monthIncome = salesTotal + suppliersPaidTotal;
    const monthOut = expensesTotal + suppliersBoughtTotal;
    const monthNetProfit = monthIncome - monthOut;

    return {
      monthName,
      salesTotal,
      expensesTotal,
      suppliersBoughtTotal,
      suppliersPaidTotal,
      monthIncome,
      monthOut,
      monthNetProfit,
    };
  });

  const currentMonthStr = extractMonthFromDate(getDateTimeFormatted());
  const mohamedAdvances = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.isEmp &&
        t.empName === "محمد" &&
        t.month === currentMonthStr,
    )
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const esmailAdvances = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.isEmp &&
        t.empName === "إسماعيل" &&
        t.month === currentMonthStr,
    )
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const filteredTransactions = transactions.filter((t) => {
    if (selectedArchiveMonth !== "all" && t.month !== selectedArchiveMonth) {
      return false;
    }
    if (selectedCategory === "supplier") {
      if (t.type !== "supplier" && t.type !== "supplier_in") return false;
    } else if (selectedCategory === "employee") {
      if (t.type !== "expense" || !t.isEmp) return false;
    } else if (selectedCategory === "expense") {
      if (t.type !== "expense" || t.isEmp) return false;
    } else if (selectedCategory !== "all" && t.type !== selectedCategory) {
      return false;
    }
    return true;
  });

  const aggregatedMonthlyMap = {};
  transactions.forEach((t) => {
    if (selectedArchiveMonth !== "all" && t.month !== selectedArchiveMonth) return;
    let subKey = t.desc || t.subtype || "general";
    if (t.type === "expense" && t.isEmp) {
      subKey = `emp_${t.empName}`;
    }
    const key = `${t.month}_${t.type}_${subKey}`;

    if (!aggregatedMonthlyMap[key]) {
      aggregatedMonthlyMap[key] = {
        id: key,
        month: t.month,
        type: t.type,
        desc: t.desc,
        subtype: t.subtype,
        isEmp: t.isEmp,
        empName: t.empName,
        totalAmount: 0,
        count: 0,
      };
    }
    aggregatedMonthlyMap[key].totalAmount += parseFloat(t.amount) || 0;
    aggregatedMonthlyMap[key].count += 1;
  });

  const aggregatedMonthlyList = Object.values(aggregatedMonthlyMap).filter(
    (item) => {
      if (selectedCategory === "supplier") {
        if (item.type !== "supplier" && item.type !== "supplier_in")
          return false;
      } else if (selectedCategory === "employee") {
        if (item.type !== "expense" || !item.isEmp) return false;
      } else if (selectedCategory === "expense") {
        if (item.type !== "expense" || item.isEmp) return false;
      } else if (selectedCategory !== "all" && item.type !== selectedCategory)
        return false;
      return true;
    },
  );

  const printSingleInvoice = (item) => {
    setSelectedInvoiceItem(item);
    setPrintOption("single_invoice");
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 md:p-10 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10 print:hidden">
        
        {/* رأس الصفحة */}
        <header className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/50 p-5 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right w-full">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/20 font-black shrink-0">
              <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <div className="space-y-2 w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <span className="text-xs sm:text-sm bg-emerald-500/15 text-emerald-300 font-bold px-3.5 py-1.5 rounded-full border border-emerald-500/30">
                  إدارة محلات الأخوة التجاريّة
                </span>
                <span
                  className={`text-xs sm:text-sm px-3.5 py-1.5 rounded-full border font-bold flex items-center gap-2 ${isDbSynced ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}
                >
                  <Database className="w-4 h-4" /> {isDbSynced ? "قاعدة البيانات متصلة" : "غير متصل"}
                </span>
                {selectedArchiveMonth !== "all" && (
                  <span className="text-xs sm:text-sm bg-amber-500/15 text-amber-300 font-bold px-3.5 py-1.5 rounded-full border border-amber-500/30">
                    أرشيف الشهر: {selectedArchiveMonth}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                سيستم الحسابات والشئون المالية
              </h1>
              <p className="text-xs sm:text-base text-slate-300">
                إدارة المبيعات، حسابات الموردين، سلف الأخوة، والأرشيف بدقة تامة
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setShowArchiveModal(true)}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-3.5 sm:py-4 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-2xl text-xs sm:text-base font-black transition flex items-center justify-center gap-2 border border-amber-500/30 cursor-pointer shadow-lg"
            >
              <Archive className="w-5 h-5" /> أرشيف الشهر
            </button>
            <button
              onClick={() => {
                setPrintOption("full_summary");
                setShowPrintModal(true);
              }}
              className="flex-1 sm:flex-none px-5 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-2xl text-xs sm:text-base font-black transition flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 border border-emerald-500/40 cursor-pointer"
            >
              <Printer className="w-5 h-5 text-emerald-200" /> التقارير والطباعة
            </button>
          </div>
        </header>

        {/* إحصائيات عامة */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-slate-900/90 p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-2 h-full bg-emerald-500"></div>
            <div>
              <p className="text-xs sm:text-sm text-slate-300 font-bold">إجمالي المدخلات العامة</p>
              <p className="text-lg sm:text-3xl font-black text-emerald-400 mt-2">
                {totalIncome.toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-400">ج.م</span>
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </div>
          
          <div className="bg-slate-900/90 p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-2 h-full bg-rose-500"></div>
            <div>
              <p className="text-xs sm:text-sm text-slate-300 font-bold">إجمالي المصروفات والصادر</p>
              <p className="text-lg sm:text-3xl font-black text-rose-400 mt-2">
                {totalOut.toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-400">ج.م</span>
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </div>

          <div className="bg-slate-900/90 p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-2xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-2 h-full bg-amber-500"></div>
            <div>
              <p className="text-xs sm:text-sm text-slate-300 font-bold">صافي الربح الإجمالي العام</p>
              <p className={`text-lg sm:text-3xl font-black mt-2 ${netProfit >= 0 ? "text-amber-400" : "text-rose-400"}`}>
                {netProfit.toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-400">ج.م</span>
              </p>
            </div>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
          </div>
        </div>

        {/* حسابات الشركاء (محمد وإسماعيل) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 p-5 sm:p-8 rounded-3xl border border-violet-500/30 shadow-2xl space-y-5">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-black text-lg sm:text-xl shrink-0">
                  م
                </div>
                <div>
                  <h3 className="text-sm sm:text-xl font-bold text-white">الأخ: محمد</h3>
                  <p className="text-xs sm:text-sm text-slate-300">حساب السلف والراتب الثابت</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm bg-violet-500/10 text-violet-300 px-3 sm:px-4 py-2 rounded-xl border border-violet-500/20 font-bold">
                الراتب: {MOHAMED_SALARY} ج.م
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <p className="text-xs sm:text-sm text-slate-300">إجمالي المسحوبات (السلف)</p>
                <p className="text-base sm:text-2xl font-black text-rose-400 mt-2">
                  {mohamedAdvances.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ج.م</span>
                </p>
              </div>
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <p className="text-xs sm:text-sm text-slate-300">المتبقي للقبض من الراتب</p>
                <p className="text-base sm:text-2xl font-black text-emerald-400 mt-2">
                  {(MOHAMED_SALARY - mohamedAdvances).toLocaleString()} <span className="text-xs text-slate-400 font-normal">ج.م</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 p-5 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-5">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-lg sm:text-xl shrink-0">
                  إ
                </div>
                <div>
                  <h3 className="text-sm sm:text-xl font-bold text-white">الأخ: إسماعيل</h3>
                  <p className="text-xs sm:text-sm text-slate-300">حساب السلف والراتب الثابت</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm bg-indigo-500/10 text-indigo-300 px-3 sm:px-4 py-2 rounded-xl border border-indigo-500/20 font-bold">
                الراتب: {ESMAIL_SALARY} ج.م
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <p className="text-xs sm:text-sm text-slate-300">إجمالي المسحوبات (السلف)</p>
                <p className="text-base sm:text-2xl font-black text-rose-400 mt-2">
                  {esmailAdvances.toLocaleString()} <span className="text-xs text-slate-400 font-normal">ج.م</span>
                </p>
              </div>
              <div className="bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                <p className="text-xs sm:text-sm text-slate-300">المتبقي للقبض من الراتب</p>
                <p className="text-base sm:text-2xl font-black text-emerald-400 mt-2">
                  {(ESMAIL_SALARY - esmailAdvances).toLocaleString()} <span className="text-xs text-slate-400 font-normal">ج.م</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* لوحة تسجيل العمليات اليومية (كروت الإدخال) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-white font-black text-lg sm:text-xl border-b border-slate-800 pb-4">
            <Layers className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" /> لوحة تسجيل العمليات اليومية
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* كرت المبيعات */}
            <div className="bg-slate-900 p-5 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base sm:text-lg">تسجيل المبيعات</h3>
                    <p className="text-xs sm:text-sm text-slate-300">إدخال الدخل اليومي للمحل</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm text-slate-200 block mb-2 font-bold">المبلغ المحصل (ج.م)</label>
                    <input
                      type="number"
                      placeholder="أدخل المبلغ"
                      value={saleAmount}
                      onChange={(e) => setSaleAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-slate-200 block mb-2 font-bold">ملاحظة سريعة</label>
                    <input
                      type="text"
                      placeholder="مثال: وردية الصباح"
                      value={saleNote}
                      onChange={(e) => setSaleNote(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-slate-200 block mb-2 font-bold">تاريخ الحركة اليومي</label>
                    <input
                      type="text"
                      value={saleDateInput}
                      onChange={(e) => setSaleDateInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 sm:px-5 py-3.5 text-xs sm:text-sm text-emerald-400 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAdd("sale")}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base transition flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 cursor-pointer"
              >
                <Plus className="w-5 h-5" /> حفظ كرت المبيعات
              </button>
            </div>

            {/* كرت الموردين */}
            <div className="bg-slate-900 p-5 sm:p-8 rounded-3xl border border-blue-500/30 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base sm:text-lg">حسابات الموردين</h3>
                    <p className="text-xs sm:text-sm text-slate-300">شراء بضاعة أو دفع نقود</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm text-slate-200 block mb-2 font-bold">اسم المورد</label>
                    <input
                      type="text"
                      placeholder="اسم المورد"
                      value={supName}
                      onChange={(e) => setSupName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-slate-200 block mb-2 font-bold">المبلغ</label>
                    <input
                      type="number"
                      placeholder="المبلغ"
                      value={supAmount}
                      onChange={(e) => setSupAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs sm:text-sm text-slate-200 block mb-2 font-bold">نوع الحركة</label>
                      <select
                        value={supDirection}
                        onChange={(e) => setSupDirection(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3.5 sm:py-4 text-xs sm:text-sm text-white font-bold focus:outline-none"
                      >
                        <option value="out">شراء بضاعة (عليك)</option>
                        <option value="in">دفع نقدي (دفعنا)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm text-slate-200 block mb-2 font-bold">التاريخ اليومي</label>
                      <input
                        type="text"
                        value={supDateInput}
                        onChange={(e) => setSupDateInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3.5 text-xs text-blue-400 font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAdd("supplier")}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base transition flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 cursor-pointer"
              >
                <Plus className="w-5 h-5" /> حفظ كرت المورد
              </button>
            </div>

            {/* كرت المصروفات والسلف */}
            <div className="bg-slate-900 p-5 sm:p-8 rounded-3xl border border-amber-500/30 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-black">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base sm:text-lg">المصروفات والسلف</h3>
                    <p className="text-xs sm:text-sm text-slate-300">مصاريف عامة وسلف الشركاء</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs sm:text-sm text-slate-200 block mb-2 font-bold">وصف المصروف</label>
                    <input
                      type="text"
                      placeholder="مثال: كهرباء، إيجار..."
                      value={expTypeInput}
                      onChange={(e) => setExpTypeInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-slate-200 block mb-2 font-bold">المبلغ المدفوع</label>
                    <input
                      type="number"
                      placeholder="المبلغ"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isEmployeeAdvance}
                        onChange={(e) => setIsEmployeeAdvance(e.target.checked)}
                        className="w-5 h-5 rounded text-emerald-500 accent-emerald-500"
                      />
                      <span className="text-xs sm:text-sm text-amber-300 font-bold">سلفة لأحد الشركاء (محمد / إسماعيل)</span>
                    </label>

                    {isEmployeeAdvance && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setExpenseEmpName("محمد")}
                          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition border cursor-pointer ${expenseEmpName === "محمد" ? "bg-emerald-600 text-white border-emerald-500" : "bg-slate-900 text-slate-300 border-slate-700"}`}
                        >
                          محمد
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpenseEmpName("إسماعيل")}
                          className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition border cursor-pointer ${expenseEmpName === "إسماعيل" ? "bg-emerald-600 text-white border-emerald-500" : "bg-slate-900 text-slate-300 border-slate-700"}`}
                        >
                          إسماعيل
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm text-slate-200 block mb-2 font-bold">التاريخ اليومي</label>
                    <input
                      type="text"
                      value={expDateInput}
                      onChange={(e) => setExpDateInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-3.5 text-xs text-amber-400 font-bold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAdd("expense")}
                className="w-full mt-6 bg-amber-600 hover:bg-amber-500 text-white font-black py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base transition flex items-center justify-center gap-2.5 shadow-xl shadow-amber-600/30 cursor-pointer"
              >
                <Plus className="w-5 h-5" /> حفظ المصروف / السلفة
              </button>
            </div>

          </div>
        </div>

        {/* ملخص الموردين والأرباح الشهرية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {suppliersSummary.length > 0 && (
            <div className="bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
              <div className="flex items-center gap-3 text-blue-400 font-black text-base sm:text-lg border-b border-slate-800 pb-4">
                <UserCheck className="w-6 h-6" /> أرصدة الموردين الحالية
              </div>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {suppliersSummary.map((sup, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">{sup.name}</h4>
                      <p className="text-xs text-slate-300 mt-1">بضاعة: {sup.totalBought.toLocaleString()} | مدفوع: {sup.totalPaidOrReturned.toLocaleString()}</p>
                    </div>
                    <span className="text-sm sm:text-base font-black text-blue-400 bg-blue-500/10 px-3.5 py-2 rounded-xl border border-blue-500/20">
                      {sup.netBalance.toLocaleString()} ج.م
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monthlyStats.length > 0 && (
            <div className="bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-5">
              <div className="flex items-center gap-3 text-emerald-400 font-black text-base sm:text-lg border-b border-slate-800 pb-4">
                <BarChart3 className="w-6 h-6" /> الأرباح الشهرية للأخوة
              </div>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {monthlyStats.map((stat, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm sm:text-base">شهر: {stat.monthName}</h4>
                      <p className="text-xs text-slate-300 mt-1">داخل: {stat.monthIncome.toLocaleString()} | صادر: {stat.monthOut.toLocaleString()}</p>
                    </div>
                    <span className={`text-sm sm:text-base font-black px-3.5 py-2 rounded-xl border ${stat.monthNetProfit >= 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                      {stat.monthNetProfit.toLocaleString()} ج.م
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* السجلات (اليومي والشهري) */}
        <div className="bg-slate-900 p-5 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              <h2 className="text-base sm:text-xl font-black text-white">
                {activeTab === "daily" ? "السجل التفصيلي اليومي" : "السجل الشهري المجمع"}
                {selectedArchiveMonth !== "all" && ` (أرشيف: ${selectedArchiveMonth})`}
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex gap-2">
                <button
                  onClick={() => setActiveTab("daily")}
                  className={`flex-1 sm:flex-none py-2.5 px-5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${activeTab === "daily" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-300 hover:text-white"}`}
                >
                  اليومي
                </button>
                <button
                  onClick={() => setActiveTab("monthly")}
                  className={`flex-1 sm:flex-none py-2.5 px-5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${activeTab === "monthly" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-300 hover:text-white"}`}
                >
                  الشهري
                </button>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-100 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold focus:outline-none"
              >
                <option value="all">كل الأقسام</option>
                <option value="sale">مبيعات</option>
                <option value="supplier">موردين</option>
                <option value="expense">مصروفات عامة</option>
                <option value="employee">سلف الأخوة</option>
              </select>
            </div>
          </div>

          {/* عرض السجل اليومي بكروت كبيرة وواضحة */}
          {activeTab === "daily" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[700px] overflow-y-auto pr-1">
              {filteredTransactions.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-slate-400 text-sm sm:text-base font-bold">
                  لا توجد حركات مسجلة حالياً في هذا النطاق
                </div>
              ) : (
                filteredTransactions.map((t) => {
                  let cardBorder = "border-slate-800 bg-slate-950/60";
                  let label = "";
                  let badgeColor = "bg-slate-800 text-slate-300";

                  if (t.type === "sale") {
                    cardBorder = "border-emerald-900/40 bg-emerald-950/10";
                    label = "مبيعات محل الأخوة";
                    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  } else if (t.type === "supplier") {
                    cardBorder = "border-blue-900/40 bg-blue-950/10";
                    label = `شراء بضاعة من المورد: ${t.desc}`;
                    badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                  } else if (t.type === "supplier_in") {
                    cardBorder = "border-teal-900/40 bg-teal-950/10";
                    label = `دفعة نقدية للمورد: ${t.desc}`;
                    badgeColor = "bg-teal-500/10 text-teal-400 border-teal-500/20";
                  } else if (t.type === "expense") {
                    if (t.isEmp) {
                      cardBorder = "border-violet-900/40 bg-violet-950/10";
                      label = `سلفة الأخ (${t.empName}) - [${t.subtype}]`;
                      badgeColor = "bg-violet-500/10 text-violet-400 border-violet-500/20";
                    } else {
                      cardBorder = "border-amber-900/40 bg-amber-950/10";
                      label = `صادر: ${t.subtype}`;
                      badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                    }
                  }

                  const isEditing = editingId === t.id;

                  return (
                    <div
                      key={t.id}
                      className={`p-5 sm:p-7 rounded-3xl border ${cardBorder} shadow-2xl flex flex-col justify-between space-y-5 transition`}
                    >
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="text-xs sm:text-sm font-bold text-amber-300">وضع التعديل المباشر:</div>
                          <input
                            type="text"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white font-bold"
                          />
                          {t.type === "expense" && (
                            <input
                              type="text"
                              value={editTypeInput}
                              onChange={(e) => setEditTypeInput(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white font-bold"
                            />
                          )}
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white font-bold"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-3">
                            <span className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black border self-start ${badgeColor}`}>
                              {label}
                            </span>
                            <span className="text-xl sm:text-3xl font-black text-white">
                              {parseFloat(t.amount).toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-300">ج.م</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-3 border-t border-slate-800 text-xs sm:text-sm text-slate-300">
                            <span className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 font-bold text-emerald-400 text-xs sm:text-sm">
                              <Clock className="w-4 h-4" /> {t.date}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800 flex-wrap">
                        <button
                          onClick={() => printSingleInvoice(t)}
                          className="px-3.5 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-300 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition border border-emerald-500/20 cursor-pointer"
                        >
                          <Printer className="w-4 h-4" /> طباعة
                        </button>

                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEdit(t.id)}
                                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <Check className="w-4 h-4" /> حفظ
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                <X className="w-4 h-4" /> إلغاء
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(t)}
                                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4 text-blue-400" /> تعديل
                              </button>
                              <button
                                onClick={() => handleDelete(t.id)}
                                className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition border border-rose-500/20 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" /> حذف
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* عرض السجل الشهري المجمع */}
          {activeTab === "monthly" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[700px] overflow-y-auto pr-1">
              {aggregatedMonthlyList.length === 0 ? (
                <div className="col-span-2 text-center py-16 text-slate-400 text-sm sm:text-base font-bold">
                  لا توجد بيانات شهرية مسجلة حالياً
                </div>
              ) : (
                aggregatedMonthlyList.map((item) => {
                  let cardBorder = "border-slate-800 bg-slate-950/60";
                  let label = "";
                  let badgeColor = "bg-slate-800 text-slate-300";

                  if (item.type === "sale") {
                    cardBorder = "border-emerald-900/40 bg-emerald-950/10";
                    label = "إجمالي مبيعات محل الأخوة للشهر";
                    badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  } else if (item.type === "supplier") {
                    cardBorder = "border-blue-900/40 bg-blue-950/10";
                    label = `إجمالي بضاعة من المورد (${item.desc})`;
                    badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                  } else if (item.type === "supplier_in") {
                    cardBorder = "border-teal-900/40 bg-teal-950/10";
                    label = `إجمالي المدفوع للمورد (${item.desc})`;
                    badgeColor = "bg-teal-500/10 text-teal-400 border-teal-500/20";
                  } else if (item.type === "expense") {
                    if (item.isEmp) {
                      cardBorder = "border-violet-900/40 bg-violet-950/10";
                      label = `إجمالي سلف الأخ (${item.empName})`;
                      badgeColor = "bg-violet-500/10 text-violet-400 border-violet-500/20";
                    } else {
                      cardBorder = "border-amber-900/40 bg-amber-950/10";
                      label = `إجمالي مصروف (${item.subtype})`;
                      badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                    }
                  }

                  return (
                    <div
                      key={item.id}
                      className={`p-5 sm:p-7 rounded-3xl border ${cardBorder} shadow-2xl flex flex-col justify-between space-y-4`}
                    >
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2.5">
                          <span className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black border self-start ${badgeColor}`}>
                            {label}
                          </span>
                          <span className="text-xl sm:text-3xl font-black text-white">
                            {parseFloat(item.totalAmount).toLocaleString()} <span className="text-xs sm:text-sm font-normal text-slate-300">ج.م</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-sm text-slate-300">
                          <span className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 font-bold text-emerald-400 text-xs sm:text-sm">
                            <Calendar className="w-4 h-4" /> الشهر: {item.month}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* مودال الأرشيف */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Archive className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-lg font-black text-white">أرشيف وعرض الأشهر السابقة</h3>
              </div>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300">
              اختر الشهر الذي تريد استعراض كافة سجلاته، أو اختر عرض جميع الأشهر المتاحة في قاعدة البيانات:
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedArchiveMonth("all");
                  setShowArchiveModal(false);
                }}
                className={`w-full text-right p-4 rounded-2xl border text-xs sm:text-sm font-black transition cursor-pointer ${selectedArchiveMonth === "all" ? "bg-emerald-600 text-white border-emerald-500" : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"}`}
              >
                عرض كل الأشهر والبيانات المسجلة (الكل)
              </button>
              
              {monthsList.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedArchiveMonth(m);
                    setShowArchiveModal(false);
                  }}
                  className={`w-full text-right p-4 rounded-2xl border text-xs sm:text-sm font-black transition cursor-pointer ${selectedArchiveMonth === m ? "bg-amber-600 text-white border-amber-500" : "bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800"}`}
                >
                  شهر: {m}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowArchiveModal(false)}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* مودال التقارير والطباعة */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm sm:text-lg font-black text-white">اختر التقرير المراد طباعته</h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label
                onClick={() => setPrintOption("full_summary")}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border cursor-pointer transition ${printOption === "full_summary" ? "bg-emerald-950/40 border-emerald-500 shadow-lg" : "bg-slate-950 border-slate-800 hover:bg-slate-800"}`}
              >
                <span className="text-xs sm:text-base font-black text-white">تقرير العمليات التفصيلي بالتاريخ والوقت</span>
              </label>

              <label
                onClick={() => setPrintOption("supplier_statement")}
                className={`flex flex-col gap-3 p-4 sm:p-5 rounded-2xl border cursor-pointer transition ${printOption === "supplier_statement" ? "bg-emerald-950/40 border-emerald-500 shadow-lg" : "bg-slate-950 border-slate-800 hover:bg-slate-800"}`}
              >
                <span className="text-xs sm:text-base font-black text-white">طباعة كشف حساب مفصل لمورد بالاسم</span>
                {printOption === "supplier_statement" && (
                  <select
                    value={selectedSupplierForPrint}
                    onChange={(e) => setSelectedSupplierForPrint(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-100 p-3.5 rounded-xl text-xs sm:text-sm font-bold mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">-- اختر اسم المورد --</option>
                    {supplierNamesList.map((name, index) => (
                      <option key={index} value={name}>{name}</option>
                    ))}
                  </select>
                )}
              </label>

              <label
                onClick={() => setPrintOption("mohamed_slip")}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border cursor-pointer transition ${printOption === "mohamed_slip" ? "bg-emerald-950/40 border-emerald-500 shadow-lg" : "bg-slate-950 border-slate-800 hover:bg-slate-800"}`}
              >
                <span className="text-xs sm:text-base font-black text-white">فاتورة حساب وسلف الأخ: محمد</span>
              </label>
              
              <label
                onClick={() => setPrintOption("esmail_slip")}
                className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl border cursor-pointer transition ${printOption === "esmail_slip" ? "bg-emerald-950/40 border-emerald-500 shadow-lg" : "bg-slate-950 border-slate-800 hover:bg-slate-800"}`}
              >
                <span className="text-xs sm:text-base font-black text-white">فاتورة حساب وسلف الأخ: إسماعيل</span>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center gap-4">
              <button
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (printOption === "supplier_statement" && !selectedSupplierForPrint) {
                    return alert("الرجاء اختيار اسم المورد أولاً للطباعة");
                  }
                  setShowPrintModal(false);
                  setTimeout(() => {
                    window.print();
                  }, 300);
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-2xl text-xs sm:text-sm font-black shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Printer className="w-5 h-5 text-white" /> تنفيذ الطباعة / PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* قسم الطباعة الفعلي */}
      <div className="hidden print:block print:bg-white print:text-black p-8 font-sans" dir="rtl">
        <div className="text-center pb-6 border-b-2 border-black space-y-2">
          <h1 className="text-3xl font-black">محل الأخوة للحسابات والشئون المالية</h1>
          <p className="text-sm font-bold text-gray-700">تاريخ ووقت الإصدار: {getDateTimeFormatted()}</p>
        </div>

        {printOption === "full_summary" && (
          <div className="mt-6 space-y-5">
            <h2 className="text-xl font-bold border-b pb-3">سجل العمليات التفصيلي</h2>
            <table className="w-full text-right border-collapse border border-gray-400 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-3">التاريخ والوقت</th>
                  <th className="border border-gray-400 p-3">نوع العملية / الوصف</th>
                  <th className="border border-gray-400 p-3">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="border border-gray-400 p-6 text-center">لا توجد عمليات مسجلة</td>
                  </tr>
                ) : (
                  transactions.map((t, index) => {
                    let typeLabel = "حركة مالية";
                    if (t.type === "sale") typeLabel = "مبيعات محل الأخوة";
                    else if (t.type === "supplier") typeLabel = `شراء بضاعة (${t.desc})`;
                    else if (t.type === "supplier_in") typeLabel = `دفعة نقدية لمورد (${t.desc})`;
                    else if (t.type === "expense") {
                      typeLabel = t.isEmp ? `سلفة الأخ ${t.empName} (${t.subtype})` : `مصروف عام (${t.subtype})`;
                    }

                    return (
                      <tr key={index} className="border border-gray-400">
                        <td className="border border-gray-400 p-3 font-bold">{t.date}</td>
                        <td className="border border-gray-400 p-3 font-medium">{typeLabel}</td>
                        <td className="border border-gray-400 p-3 font-bold">{parseFloat(t.amount).toLocaleString()} ج.م</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div className="p-4 border-2 border-black rounded-xl bg-gray-50 flex justify-between items-center text-base font-bold">
              <span>إجمالي صافي أرباح المحل:</span>
              <span className="text-lg">{netProfit.toLocaleString()} ج.م</span>
            </div>
          </div>
        )}

        {printOption === "supplier_statement" && (
          <div className="mt-6 space-y-5">
            <h2 className="text-xl font-bold border-b pb-3">كشف حساب مفصل للمورد: <span className="text-blue-700">{selectedSupplierForPrint}</span></h2>
            
            <table className="w-full text-right border-collapse border border-gray-400 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-3">التاريخ والوقت</th>
                  <th className="border border-gray-400 p-3">نوع الحركة</th>
                  <th className="border border-gray-400 p-3">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {transactions
                  .filter((t) => (t.type === "supplier" || t.type === "supplier_in") && t.desc === selectedSupplierForPrint)
                  .map((t, idx) => (
                    <tr key={idx} className="border border-gray-400">
                      <td className="border border-gray-400 p-3 font-bold">{t.date}</td>
                      <td className="border border-gray-400 p-3">
                        {t.type === "supplier" ? "شراء بضاعة (عليك)" : "دفعة نقدية / مرتجع (دفعنا له)"}
                      </td>
                      <td className="border border-gray-400 p-3 font-bold">{parseFloat(t.amount).toLocaleString()} ج.م</td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {(() => {
              const supData = suppliersSummary.find((s) => s.name === selectedSupplierForPrint) || { totalBought: 0, totalPaidOrReturned: 0, netBalance: 0 };
              return (
                <div className="p-4 border-2 border-black rounded-xl bg-gray-50 space-y-3 text-sm font-bold">
                  <div className="flex justify-between"><span>إجمالي البضاعة المشتراة منه:</span><span>{supData.totalBought.toLocaleString()} ج.م</span></div>
                  <div className="flex justify-between"><span>إجمالي المدفوع له:</span><span>{supData.totalPaidOrReturned.toLocaleString()} ج.م</span></div>
                  <hr className="border-gray-400" />
                  <div className="flex justify-between text-base"><span>الصافي المتبقي في حسابه:</span><span className="text-lg">{supData.netBalance.toLocaleString()} ج.م</span></div>
                </div>
              );
            })()}
          </div>
        )}

        {printOption === "mohamed_slip" && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold border-b pb-3">فاتورة حساب وسلف الأخ: محمد (شهر: {currentMonthStr})</h2>
            <div className="p-6 border border-gray-300 rounded-xl space-y-4 bg-gray-50 text-sm">
              <p>الراتب الثابت المتفق عليه: <strong className="float-left">{MOHAMED_SALARY} ج.م</strong></p>
              <p>إجمالي المسحوبات والسلف الشهرية: <strong className="float-left text-red-600">{mohamedAdvances} ج.م</strong></p>
              <hr className="border-gray-300" />
              <p className="text-base font-bold">المتبقي الصافي للقبض: <strong className="float-left text-green-700">{MOHAMED_SALARY - mohamedAdvances} ج.م</strong></p>
            </div>
          </div>
        )}

        {printOption === "esmail_slip" && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold border-b pb-3">فاتورة حساب وسلف الأخ: إسماعيل (شهر: {currentMonthStr})</h2>
            <div className="p-6 border border-gray-300 rounded-xl space-y-4 bg-gray-50 text-sm">
              <p>الراتب الثابت المتفق عليه: <strong className="float-left">{ESMAIL_SALARY} ج.م</strong></p>
              <p>إجمالي المسحوبات والسلف الشهرية: <strong className="float-left text-red-600">{esmailAdvances} ج.م</strong></p>
              <hr className="border-gray-300" />
              <p className="text-base font-bold">المتبقي الصافي للقبض: <strong className="float-left text-green-700">{ESMAIL_SALARY - esmailAdvances} ج.م</strong></p>
            </div>
          </div>
        )}

        {printOption === "single_invoice" && selectedInvoiceItem && (
          <div className="mt-8 space-y-4 max-w-md mx-auto border-2 border-black p-6 rounded-2xl bg-white text-sm">
            <div className="text-center pb-4 border-b border-black">
              <h2 className="text-2xl font-black">فاتورة حركة مالية مفردة</h2>
              <p className="text-xs text-gray-600 mt-1">محل الأخوة للتجارة</p>
            </div>
            <div className="space-y-3 py-2">
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold">تاريخ ووقت الحركة:</span>
                <span>{selectedInvoiceItem.date}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold">الشهر المحاسبي:</span>
                <span>{selectedInvoiceItem.month}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold">نوع العملية:</span>
                <span>
                  {selectedInvoiceItem.type === "sale"
                    ? "مبيعات محل الأخوة"
                    : selectedInvoiceItem.type === "supplier"
                    ? `شراء بضاعة (مورد: ${selectedInvoiceItem.desc})`
                    : selectedInvoiceItem.type === "supplier_in"
                    ? `دفعة نقدية (مورد: ${selectedInvoiceItem.desc})`
                    : selectedInvoiceItem.isEmp
                    ? `سلفة للأخ: ${selectedInvoiceItem.empName}`
                    : `مصروف: ${selectedInvoiceItem.subtype}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-base font-black">
                <span>المبلغ الإجمالي:</span>
                <span className="text-lg">{parseFloat(selectedInvoiceItem.amount).toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-20 pt-8 border-t border-gray-400 flex justify-between text-sm font-bold">
          <div>توقيع المسؤول: ..........................</div>
          <div>توقيع المحاسب: ..........................</div>
        </div>
      </div>
    </div>
  );
}