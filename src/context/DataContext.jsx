import { createContext, useContext, useReducer, useCallback } from 'react';
import { parseFile as parseAlipay } from '../utils/parser';
import { parseWechatFile } from '../utils/parserWechat';
import { classifyAll } from '../utils/classifier';
import {
  monthlyTrend,
  categoryBreakdown,
  findAnomalies,
  highFrequencyAnalysis,
  generateRecommendations,
} from '../utils/analyzer';
import { detectTraps } from '../utils/trapDetector';

const DataContext = createContext(null);

const initialState = {
  loading: false,
  error: null,
  transactions: [],
  allRecordsSummary: null,
  analysis: null,
  billType: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'PARSE_START':
      return { ...state, loading: true, error: null };
    case 'PARSE_SUCCESS':
      return {
        ...state,
        loading: false,
        transactions: action.payload.transactions,
        allRecordsSummary: action.payload.allRecordsSummary,
        analysis: action.payload.analysis,
        billType: action.payload.billType,
      };
    case 'PARSE_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'LOAD_SAVED':
      return {
        ...state,
        loading: false,
        error: null,
        transactions: action.payload.transactions,
        allRecordsSummary: action.payload.allRecordsSummary,
        analysis: action.payload.analysis,
        billType: action.payload.billType || null,
      };
    case 'CLEAR_DATA':
      return { ...initialState };
    default:
      return state;
  }
}

function runAnalysis(expenses, summary, billType) {
  const classification = classifyAll(expenses);
  const trend = monthlyTrend(expenses);
  const catBreakdown = categoryBreakdown(expenses);
  const anomalies = findAnomalies(expenses);
  const highFreq = highFrequencyAnalysis(expenses);
  const recommendations = generateRecommendations(expenses, classification, summary);
  const trapData = detectTraps(expenses);

  return {
    transactions: expenses,
    allRecordsSummary: summary,
    billType,
    analysis: { classification, trend, catBreakdown, anomalies, highFreq, recommendations, trapData },
  };
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadFile = useCallback(async (file, billType = 'alipay') => {
    dispatch({ type: 'PARSE_START' });
    try {
      const parser = billType === 'wechat' ? parseWechatFile : parseAlipay;
      const { expenses, summary } = await parser(file);
      const payload = runAnalysis(expenses, summary, billType);

      dispatch({ type: 'PARSE_SUCCESS', payload });
    } catch (err) {
      dispatch({ type: 'PARSE_ERROR', payload: err.message });
    }
  }, []);

  const loadSavedResult = useCallback((savedResult) => {
    const expenses = savedResult.transactions || [];
    const summary = savedResult.allRecordsSummary || { income: [], expense: expenses, neutral: [] };
    const payload = runAnalysis(expenses, summary, savedResult.billType || null);

    dispatch({ type: 'LOAD_SAVED', payload });
  }, []);

  const clearData = useCallback(() => {
    dispatch({ type: 'CLEAR_DATA' });
  }, []);

  return (
    <DataContext.Provider value={{ ...state, loadFile, loadSavedResult, clearData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
