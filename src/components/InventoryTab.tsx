import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Sparkles, 
  Edit3, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  X,
  RefreshCw,
  Info,
  Layers,
  Database,
  Lock,
  Trash2
} from 'lucide-react';
import { Customer, PaperStock, EmployeeUser } from '../types';
import { parseFractionOrExpression, cleanLeadingZeros } from '../utils';

interface InventoryTabProps {
  paperStocks: PaperStock[];
  customers: Customer[];
  onUpdateStocks: (stocks: PaperStock[]) => void;
  onResetStocks: () => void;
  currentUser: EmployeeUser | null;
}

export default function InventoryTab({ 
  paperStocks, 
  customers, 
  onUpdateStocks,
  onResetStocks,
  currentUser
}: InventoryTabProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  
  // State for Add/Edit Stock
  const [editingStock, setEditingStock] = useState<PaperStock | null>(null);
  const [newStockName, setNewStockName] = useState('');
  const [newStockInitial, setNewStockInitial] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Math expression string inputs for the numerical inventory editing fields
  const [editInitialInput, setEditInitialInput] = useState<string>('');

  // Non-blocking custom delete tracking ID for paper stocks
  const [deletingStockId, setDeletingStockId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // Helper formula to compute Total Consumed for a specific stock name
  const computeTotalConsumed = (name: string): number => {
    let consumed = 0;
    const lowerName = name.trim().toLowerCase();
    
    customers.forEach(c => {
      const orderQty = Number(c.quantity || 0);

      // Paper 1 (multiplied by order quantity for 1-for-1 cards, rounded up if not natural / whole number)
      if (c.paperType1 && c.paperType1.trim().toLowerCase() === lowerName) {
        consumed += Math.ceil(Number(c.amount1 || 0) * orderQty);
      }
      // Paper 2 (multiplied by order quantity, rounded up if not natural / whole)
      if (c.paperType2 && c.paperType2.trim().toLowerCase() === lowerName) {
        consumed += Math.ceil(Number(c.amount2 || 0) * orderQty);
      }
      // Paper 3 (multiplied by order quantity, rounded up if not natural / whole)
      if (c.paperType3 && c.paperType3.trim().toLowerCase() === lowerName) {
        consumed += Math.ceil(Number(c.amount3 || 0) * orderQty);
      }
      // Entrance Paper (divided by 16 - rounded up to next whole number)
      if (c.entrancePaper && c.entrancePaper.trim().toLowerCase() === lowerName) {
        consumed += Math.ceil(Number(c.amount16 || 0) / 16);
      }
      // Ajabi Paper (divided by 9 - rounded up to next whole number)
      if (c.ajabiPaper && c.ajabiPaper.trim().toLowerCase() === lowerName) {
        consumed += Math.ceil(Number(c.amount9 || 0) / 9);
      }
    });

    return consumed;
  };

  const getStatus = (current: number) => {
    if (current <= 0) {
      return { 
        text: '❌ OUT OF STOCK', 
        classes: 'bg-[#2E181D] text-[#F87171] border-[#5D2D35]' 
      };
    } else if (current < 50) {
      return { 
        text: '⚠️ LOW STOCK - REORDER', 
        classes: 'bg-[#2D210F] text-[#FACC15] border-[#5A4515] animate-pulse' 
      };
    } else {
      return { 
        text: '✅ HEALTHY', 
        classes: 'bg-[#112918] text-[#71b536] border-[#71b536]/20' 
      };
    }
  };

  const filteredStocks = paperStocks.filter(stock => 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStockName.trim()) return;
    
    const exists = paperStocks.some(s => s.name.trim().toLowerCase() === newStockName.trim().toLowerCase());
    if (exists) {
      alert(`"${newStockName}" already exists in the inventory dashboard list.`);
      return;
    }

    const evaluatedInitial = Math.max(0, parseFractionOrExpression(newStockInitial));

    const newStock: PaperStock = {
      id: 'p_' + Date.now(),
      name: newStockName.trim(),
      initialStock: evaluatedInitial
    };

    onUpdateStocks([...paperStocks, newStock]);
    setNewStockName('');
    setNewStockInitial('');
    setShowAddForm(false);
  };

  const handleEditStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStock) return;

    const evaluatedVal = Math.max(0, parseFractionOrExpression(editInitialInput));
    const finalStockItem = { ...editingStock, initialStock: evaluatedVal };

    const updated = paperStocks.map(s => 
      s.id === editingStock.id ? finalStockItem : s
    );
    onUpdateStocks(updated);
    setEditingStock(null);
  };

  const handleDeleteStock = (id: string) => {
    const updated = paperStocks.filter(s => s.id !== id);
    onUpdateStocks(updated);
    setDeletingStockId(null);
  };

  // High-level statistics
  const totalItems = paperStocks.length;
  const calculatedStocks = paperStocks.map(s => {
    const consumed = computeTotalConsumed(s.name);
    const remaining = s.initialStock - consumed;
    return { ...s, consumed, remaining };
  });

  const lowStockCount = calculatedStocks.filter(s => s.remaining < 50 && s.remaining > 0).length;
  const outOfStockCount = calculatedStocks.filter(s => s.remaining <= 0).length;
  const totalInitialSheets = paperStocks.reduce((sum, s) => sum + s.initialStock, 0);
  const totalRemainingSheets = calculatedStocks.reduce((sum, s) => sum + Math.max(0, s.remaining), 0);

  return (
    <div className="space-y-6 select-none" id="inventory-tab-pnl">
      
      {/* Dynamic Summary Cards - Responsive Flex spacing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Variants */}
        <div className="bg-[#121212] border border-[#262626] rounded-none p-4 flex items-center justify-between shadow-none">
          <div>
            <span className="text-xs text-gray-400 font-mono tracking-wider uppercase block">Total Paper Variants</span>
            <span className="text-2xl font-mono font-bold text-white mt-1 block">{totalItems}</span>
          </div>
          <div className="p-3 bg-[#1C1C1C] text-[#ee317b]">
            <Package className="w-5 h-5" />
          </div>
        </div>
        
        {/* Sheets on hand (using secondary theme green) */}
        <div className="bg-[#121212] border border-[#262626] rounded-none p-4 flex items-center justify-between shadow-none">
          <div>
            <span className="text-xs text-gray-400 font-mono tracking-wider uppercase block">Sheets on Hand</span>
            <span className="text-2xl font-mono font-bold text-[#71b536] mt-1 block">
              {totalRemainingSheets.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="text-xs font-normal text-gray-500 ml-1">/ {totalInitialSheets.toLocaleString()}</span>
            </span>
          </div>
          <div className="p-3 bg-[#1C1C1C] text-[#71b536]">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Low Stock count */}
        <div className="bg-[#121212] border border-[#262626] rounded-none p-4 flex items-center justify-between shadow-none">
          <div>
            <span className="text-xs text-gray-400 font-mono tracking-wider uppercase block">Low Stock Alert</span>
            <span className="text-2xl font-mono font-bold text-[#FACC15] mt-1 block">{lowStockCount} items</span>
          </div>
          <div className="p-3 bg-[#1D1B12] text-[#FACC15]">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Out of Stock count */}
        <div className="bg-[#121212] border border-[#262626] rounded-none p-4 flex items-center justify-between shadow-none">
          <div>
            <span className="text-xs text-gray-400 font-mono tracking-wider uppercase block">Out of Stock Alert</span>
            <span className="text-2xl font-mono font-bold text-[#F87171] mt-1 block">{outOfStockCount} items</span>
          </div>
          <div className="p-3 bg-[#1E1214] text-[#F87171]">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar & Formulas Accordion */}
      <div className="bg-[#121212] border border-[#262626] rounded-none p-4 shadow-none flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search paper stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-[#181818] text-white hover:bg-[#1C1C1C] focus:bg-[#1C1C1C] border border-[#262626] rounded-none outline-none focus:border-[#ee317b] transition-all font-sans"
            />
          </div>
          
          <button 
            type="button"
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-mono text-gray-300 bg-[#181818] hover:bg-[#262626] border border-[#262626] rounded-none cursor-pointer transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-[#ee317b]" />
            Formula Logic Specs
          </button>
        </div>

        {isAdmin ? (
          <div className="flex items-stretch sm:items-center gap-2 select-none">
            <button
              type="button"
              onClick={onResetStocks}
              className="text-xs font-mono text-gray-400 bg-[#121212] hover:bg-[#1C1C1C] border border-[#262626] rounded-none px-3 py-1.5 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Reset Stock to default system values"
            >
              <RefreshCw className="w-3 h-3 text-[#ee317b]" />
              Reset Defaults
            </button>
            
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="text-xs font-mono font-bold text-white bg-[#ee317b] hover:bg-[#d61e63] border border-[#ee317b] rounded-none px-3.5 py-1.5 flex items-center justify-center gap-1.5 shadow-none transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Paper Stock
            </button>
          </div>
        ) : (
          <div className="text-xs font-mono text-gray-500 bg-[#151515] border border-[#262626] px-3 py-1.5 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#ee317b]" />
            EMPLOYEE ACCESS: Inventory is READ-ONLY
          </div>
        )}
      </div>

      {/* Formula Logic Breakdown Modal/Box */}
      <AnimatePresence>
        {showFormulaInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#121212] border border-[#262626] rounded-none p-4 text-gray-300 text-sm leading-relaxed space-y-3 font-sans">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-white flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4 text-[#ee317b]" />
                  MENA INC V2.1 SPREADSHEET FORMULA BLUEPRINT
                </h4>
                <button 
                  onClick={() => setShowFormulaInfo(false)}
                  className="text-gray-400 hover:text-white cursor-pointer"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Primary paper quantity is multiplied by card quantity. Entrance/Ajabi auxiliary quantities are divided by 16 or 9. The exact Google Sheets formulas are:
              </p>
              
              <div className="bg-[#181818] border border-[#262626] p-4 text-xs font-mono space-y-2 text-gray-400">
                <span className="text-[#ee317b] font-bold block">Consolidated Excel Formula (Cell C2 equivalent):</span>
                <p className="line-clamp-none break-all font-mono leading-relaxed bg-[#101010] p-2 text-gray-200 border border-[#262626]">
                  =SUMPRODUCT(('Customer management'!$L:$L=A2)*'Customer management'!$M:$M, 'Customer management'!$G:$G)
                  + SUMPRODUCT(('Customer management'!$N:$N=A2)*'Customer management'!$O:$O, 'Customer management'!$G:$G)
                  + SUMPRODUCT(('Customer management'!$P:$P=A2)*'Customer management'!$Q:$Q, 'Customer management'!$G:$G)
                  + (SUMIF('Customer management'!$R:$R, A2, 'Customer management'!$S:$S) / 16)
                  + (SUMIF('Customer management'!$T:$T, A2, 'Customer management'!$U:$U) / 9)
                </p>
                
                <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-gray-300 leading-normal">
                  <div>
                    <strong className="text-stone-300 block mb-1">Standard Papers (1-per-card, multiplied)</strong>
                    Col L &amp; M, Col N &amp; O, Col P &amp; Q deduct sheets multiplied by Order Quantity (Col G).
                  </div>
                  <div>
                    <strong className="text-[#71b536] block mb-1">Entrance &amp; Ajabi Auxiliary (Divided ratios)</strong>
                    Entrance Paper gets divided by 16. Ajabi Paper gets divided by 9.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Inventory Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* List of Stocks - Responsive scroll table */}
        <div className="bg-[#121212] border border-[#262626] rounded-none lg:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#262626] flex items-center justify-between bg-[#181818]">
            <span className="font-mono font-bold text-white uppercase text-xs tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-[#ee317b]" />
              Paper Warehouse ledger
            </span>
            <span className="text-[10px] font-mono text-gray-500 uppercase">Interactive Sheets Deduct System</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-[#181818] border-b border-[#262626] text-gray-400 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold text-gray-400">Paper Stock Name (Col A)</th>
                  <th className="py-3 px-4 font-semibold text-gray-400 text-right">Initial Sheets (Col B)</th>
                  <th className="py-3 px-4 font-semibold text-gray-400 text-right">Total Consumed (Col C)</th>
                  <th className="py-3 px-4 font-semibold text-gray-400 text-right">Stock on Hand (Col D)</th>
                  <th className="py-3 px-4 font-semibold text-gray-400">Status Alert (Col E)</th>
                  <th className="py-3 px-4 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626] text-gray-300 font-mono">
                {calculatedStocks.map((stock) => {
                  const status = getStatus(stock.remaining);
                  return (
                    <tr key={stock.id} className="hover:bg-[#181818] transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4 font-sans font-bold text-white">{stock.name}</td>
                      
                      {/* Initial sheets */}
                      <td className="py-3 px-4 text-right">{stock.initialStock.toLocaleString()}</td>
                      
                      {/* Consumed Sheets */}
                      <td className="py-3 px-4 text-right text-yellow-400/90 font-medium bg-yellow-950/5">
                        {stock.consumed > 0 ? stock.consumed.toLocaleString() : '0'}
                      </td>
                      
                      {/* Remaining On Hand */}
                      <td className={`py-3 px-4 text-right font-bold ${stock.remaining <= 0 ? 'text-[#F87171] bg-[#2E181D]/10' : 'text-[#71b536]'}`}>
                        {stock.remaining.toLocaleString()}
                      </td>
                      
                      {/* Status badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 border text-[10px] font-bold ${status.classes}`}>
                          {status.text}
                        </span>
                      </td>

                      {/* EDIT & DELETE buttons */}
                      <td className="py-3 px-4 text-center">
                        {isAdmin ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingStock(stock);
                                setEditInitialInput(stock.initialStock.toString());
                              }}
                              className="text-gray-400 hover:text-[#ee317b] hover:bg-[#262626] p-1.5 rounded-none transition-colors cursor-pointer"
                              title={`Update Initial Purchase of "${stock.name}"`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingStockId(stock.id)}
                              className="text-gray-500 hover:text-[#F87171] hover:bg-[#262626] p-1.5 rounded-none transition-colors cursor-pointer"
                              title={`Delete "${stock.name}" entirely from system`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Lock className="w-3.5 h-3.5 mx-auto text-gray-600" title="Admin permissions required" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDE BAR / SUBMIT FORMS CONTROLLER */}
        <div className="space-y-6">
          
          {/* Quick Edit Sheet Stock Initial State */}
          <AnimatePresence>
            {editingStock && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-[#121212] border border-[#262626] rounded-none p-4 shadow-none"
              >
                <div className="flex justify-between items-center border-b border-[#262626] pb-3 mb-4 select-none">
                  <span className="font-mono font-bold text-white text-xs uppercase flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#ee317b]" />
                    Adjust Initial Stock
                  </span>
                  <button 
                    onClick={() => setEditingStock(null)} 
                    className="text-gray-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleEditStockSubmit} className="space-y-4 font-mono text-xs text-gray-300">
                  <div>
                    <span className="text-gray-500 block mb-1 uppercase tracking-wider">Stock Name (Read-Only)</span>
                    <p className="bg-[#181818] px-3 py-2 text-white border border-[#262626]">
                      {editingStock.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 uppercase tracking-wider" htmlFor="field-initial-stock">Initial Quantity (Sheets, expression enabled)</label>
                    <input
                      id="field-initial-stock"
                      type="text"
                      required
                      placeholder="e.g. 500+250"
                      value={editInitialInput}
                      onChange={(e) => {
                        const cleaned = cleanLeadingZeros(e.target.value);
                        setEditInitialInput(cleaned);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = parseFractionOrExpression(editInitialInput);
                          setEditInitialInput(val.toString());
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#181818] border border-[#262626] text-white rounded-none outline-none focus:border-[#ee317b]"
                    />
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">
                      Parsed: {parseFractionOrExpression(editInitialInput)} sheets
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 select-none">
                    <button
                      type="button"
                      onClick={() => setEditingStock(null)}
                      className="px-3 py-1.5 bg-transparent border border-transparent text-gray-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#ee317b] hover:bg-[#d61e63] text-white font-bold cursor-pointer"
                    >
                      Save Stock
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Create New Stock Variant */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-[#121212] border border-[#262626] rounded-none p-4 shadow-none"
              >
                <div className="flex justify-between items-center border-b border-[#262626] pb-3 mb-4 select-none">
                  <span className="font-mono font-bold text-white text-xs uppercase flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#ee317b]" />
                    Register New Paper
                  </span>
                  <button 
                    onClick={() => setShowAddForm(false)} 
                    className="text-gray-500 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddStock} className="space-y-4 font-mono text-xs text-gray-300">
                  <div>
                    <label className="block text-gray-400 mb-1 uppercase tracking-wider" htmlFor="field-new-stock-name">Variant Name</label>
                    <input
                      id="field-new-stock-name"
                      type="text"
                      required
                      placeholder="e.g. Bronze wave"
                      value={newStockName}
                      onChange={(e) => setNewStockName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#181818] border border-[#262626] text-white rounded-none outline-none focus:border-[#ee317b] placeholder-gray-600 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 mb-1 uppercase tracking-wider" htmlFor="field-new-stock-initial">Initial Sheets on Hand (expression enabled)</label>
                    <input
                      id="field-new-stock-initial"
                      type="text"
                      required
                      placeholder="e.g. 500 or 100 * 5"
                      value={newStockInitial}
                      onChange={(e) => setNewStockInitial(cleanLeadingZeros(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = parseFractionOrExpression(newStockInitial);
                          setNewStockInitial(val.toString());
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#181818] border border-[#262626] text-white rounded-none outline-none focus:border-[#ee317b]"
                    />
                    <div className="text-[10px] text-gray-500 mt-1 font-mono">
                      Parsed: {parseFractionOrExpression(newStockInitial)} sheets
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2 select-none">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 bg-transparent border border-transparent text-gray-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#ee317b] hover:bg-[#d61e63] text-white font-bold cursor-pointer"
                    >
                      Add Stock
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Guidelines info card helper */}
          <div className="bg-[#121212] border border-[#262626] rounded-none p-4 space-y-3 font-sans">
            <span className="font-mono text-xs text-[#ee317b] tracking-wider uppercase font-bold block">Warehouse Instructions</span>
            <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside leading-relaxed bg-[#181818]/40 p-3 border border-[#262626]">
              <li>Paper counts must be kept up-to-date daily.</li>
              <li>Stocks dropping under 50 sheets trigger a flash <strong className="text-[#FACC15]">Low Stock Alert</strong> automations.</li>
              <li>Values under or equal to 0 sheets trigger <strong className="text-[#F87171]">Out of Stock</strong>.</li>
              <li>To adjust material inventory levels directly, edit the "Initial Sheets" using the pencil icons.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Non-blocking premium delete confirmation modal for inventory paper stocks */}
      <AnimatePresence>
        {deletingStockId && (() => {
          const targetStock = paperStocks.find(s => s.id === deletingStockId);
          if (!targetStock) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#121212] border border-[#F87171] p-6 max-w-md w-full text-gray-300 font-sans shadow-none rounded-none"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#2E181D] text-[#F87171] rounded-none">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-2 text-left">
                    <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">Remove Paper Stock?</h3>
                    <p className="text-xs text-gray-400 leading-relaxed font-mono">
                      Are you sure you want to completely remove the paper stock <span className="text-white font-semibold font-mono">"{targetStock.name}"</span>?
                    </p>
                    <p className="text-xs text-[#F87171] leading-relaxed font-mono">
                      Warning: Removing this paper variant from warehouse will break active visual automatic calculations for customers ordering this paper type.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setDeletingStockId(null)}
                    className="px-3.5 py-1.5 border border-[#262626] text-gray-400 hover:text-white hover:bg-[#1C1C1C] transition-all cursor-pointer"
                  >
                    Cancel Action
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStock(deletingStockId)}
                    className="px-4 py-1.5 bg-[#F87171] hover:bg-[#EF4444] text-black font-bold transition-all cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
