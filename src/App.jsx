import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Topbar from './components/Topbar/Topbar';
import LeftPanel from './components/LeftPanel/LeftPanel';
import AskMexi from './components/AskMexi/AskMexi';
import IntelligencePanel from './components/IntelligencePanel/IntelligencePanel';
import { AllSignalsOverlay, SettingsOverlay, ProfileOverlay } from './components/Overlays';
import ExecBriefModal from './components/ExecBriefModal/ExecBriefModal';
import IPContent from './components/IntelligencePanel/IPContent';
import LoginPage from './components/Login/LoginPage';
import SignupPage from './components/Login/SignupPage';
import LoadingScreen from './components/Login/LoadingScreen';
import BizImpactDrawer from './components/LeftPanel/BizImpactDrawer';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext.jsx';
import * as authService from './services/authService';
import { setSignalApiKey, extractSignalApiKeyFromAuthResponse } from './services/signalApiKeyStore';
import {
  getSignals,
  getBizImpactCards,
  getRisksChanged,
  getExecutiveBrief,
  getExecutiveBriefOverlay,
  getDashboardRiskExposure,
  getDashboardBriefHighlights,
  getHeatmapAll,
  getAskMexiSuggestedPrompts,
  getSignalWhat,
  getSignalWhy,
  getSignalImpactTab,
  getSignalActions,
  getBootstrap,
  getTenant,
  getDataSyncStatus,
  getEngineMe,
  getEngineMeWatchlist,
  postEngineMeWatchlist,
  postEngineMeWatchlistItem,
  putEngineMeWatchlist,
  getEngineHealth,
  getSignalEngineRoot,
  getSignalsDisplayOrder,
  getSignalsListItems,
  postSignalRun,
  postSignalsEvaluateAll,
  getSignalById,
  getHeatmapFunction,
} from './services/signalsEngineApi';
import {
  mergeSignalsFromEngineResponse,
  buildSigOrderFromEngine,
  mapDisplayOrderFromApi,
  applyRunResponseToCatalog,
  applyEvaluateAllResponseToCatalog,
  buildMinimalFunctionCatalog,
  createEmptySignalEntry,
  hydrateCatalogFromBizCards,
  hydrateCatalogFromDisplayOrder,
} from './utils/mapEngineSignals';
import { mapBizImpactCardsResponse } from './utils/mapEngineBizImpact';
import {
  mapWhatFromApi,
  mapWhyFromApi,
  mapFvlaFromApi,
  mapActsFromApi,
  mapRisksChangedFromApi,
  mapBriefHighlightsToBriefRows,
  mapSuggestedPromptsFromApi,
  mapHeatmapToTiles,
  HEATMAP_PATH_BY_PANEL,
  mapHeatmapDetailToCatalogEntry,
} from './utils/mapEngineIntelligence';
import { mapTenantFromApi, mapBootstrapFromApi } from './utils/mapEngineBootstrapTenant';
import {
  mapDataSyncFromApi,
  mapEngineMeFromApi,
  mapWatchlistItemsFromApi,
  watchlistUiRowsToApiPayload,
} from './utils/mapEngineUserSync';
import { ROLES } from './data/rolesConfig';

export default function App() {
  const {
    setShowExecBrief,
    setExecBriefContent,
    setEngineTenant,
    setEngineBootstrap,
    setEngineDataSync,
    setEngineMe,
    engineTenant,
    engineBootstrap,
    engineDataSync,
    engineMe,
  } = useApp();
  const { verifySession, logout, fetchSignalKey } = useAuth();

  const [signalsCatalog, setSignalsCatalog] = useState(() => buildMinimalFunctionCatalog());
  const [bizImpactCards, setBizImpactCards] = useState([]);
  const [engineSigOrder, setEngineSigOrder] = useState(null);
  const [dataLoadError, setDataLoadError] = useState(null);
  const [risksChangedItems, setRisksChangedItems] = useState(null);
  const [healthTiles, setHealthTiles] = useState(null);
  const [askPromptsOverride, setAskPromptsOverride] = useState(null);
  const [briefOverride, setBriefOverride] = useState(null);
  const [riskExposureOverride, setRiskExposureOverride] = useState(null);

  const [authStatus, setAuthStatus] = useState(() =>
    authService.getStoredAccessToken() ? 'loading' : 'login'
  );
  const [userEmail, setUserEmail] = useState(() => authService.getStoredEmail() || '');
  
  const [currentRole, setCurrentRole] = useState('CEO');
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [currentPanelSig, setCurrentPanelSig] = useState(null);
  const [panelMode, setPanelMode] = useState('hidden');
  const [panelTab, setPanelTab] = useState('what');
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  // Overlay states
  const [allSignalsOpen, setAllSignalsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fsOverlayOpen, setFsOverlayOpen] = useState(false);
  const [chatInputTrigger, setChatInputTrigger] = useState(null);

  // Biz Impact Drawer state — lifted to App so it renders outside LeftPanel's transform
  const [activeBizCard, setActiveBizCard] = useState(null);
  const [originBizCard, setOriginBizCard] = useState(null); // Track where the user came from

  const [watchlist, setWatchlist] = useState([]);

  const syncWatchlistToEngine = useCallback(async (rows) => {
    const payload = watchlistUiRowsToApiPayload(rows);
    try {
      await postEngineMeWatchlist(payload);
    } catch {
      try {
        await putEngineMeWatchlist(payload);
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[me/watchlist]', e?.message || e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mexi_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  /** Load GET /me/watchlist on dashboard; fall back to local cache if API fails */
  useEffect(() => {
    if (authStatus !== 'dashboard') return undefined;
    let cancelled = false;
    (async () => {
      try {
        const raw = await getEngineMeWatchlist().catch(() => null);
        if (cancelled) return;
        if (raw && typeof raw === 'object') {
          setWatchlist(mapWatchlistItemsFromApi(raw, {}));
          return;
        }
      } catch {
        /* ignore */
      }
      if (cancelled) return;
      try {
        const stored = localStorage.getItem('mexi_watchlist');
        if (stored) setWatchlist(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  /** Enrich watchlist labels once signal catalog is available */
  useEffect(() => {
    if (authStatus !== 'dashboard' || !Object.keys(signalsCatalog || {}).length) return;
    setWatchlist((prev) => {
      let changed = false;
      const next = prev.map((w) => {
        const cat = signalsCatalog[w.sig];
        if (!cat?.name) return w;
        const nm = String(cat.name).trim().slice(0, 40);
        if (nm && nm !== w.id) {
          changed = true;
          return { ...w, id: nm };
        }
        return w;
      });
      return changed ? next : prev;
    });
  }, [authStatus, signalsCatalog]);

  useEffect(() => {
    if (authStatus !== 'loading') return;

    let cancelled = false;
    const minDisplay = new Promise((r) => setTimeout(r, 900));

    (async () => {
      try {
        await verifySession();
        try {
          const keyBody = await fetchSignalKey();
          const k = extractSignalApiKeyFromAuthResponse(keyBody);
          if (k) setSignalApiKey(k);
        } catch (e) {
          console.warn('Signal API key (GET/POST /api/auth/signal-key):', e?.message || e);
        }
        await minDisplay;
        if (!cancelled) setAuthStatus('dashboard');
      } catch {
        authService.clearTokens();
        if (!cancelled) {
          setUserEmail('');
          setAuthStatus('login');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus, verifySession, fetchSignalKey]);

  const reloadSignalsCatalog = useCallback(async () => {
    const settled = await Promise.allSettled([getSignals(), getSignalsDisplayOrder(), getBizImpactCards()]);
    const sigRes = settled[0].status === 'fulfilled' ? settled[0].value : null;
    const orderRaw = settled[1].status === 'fulfilled' ? settled[1].value : null;
    const displayOrderIds = orderRaw ? mapDisplayOrderFromApi(orderRaw) : null;
    const items = sigRes ? getSignalsListItems(sigRes) : [];
    const mappedBiz =
      settled[2].status === 'fulfilled' ? mapBizImpactCardsResponse(settled[2].value) : null;

    let catalog = buildMinimalFunctionCatalog();
    if (items.length > 0) {
      catalog = mergeSignalsFromEngineResponse({ data: items });
    }
    catalog = hydrateCatalogFromBizCards(catalog, mappedBiz || []);
    catalog = hydrateCatalogFromDisplayOrder(catalog, displayOrderIds);
    if (mappedBiz && mappedBiz.length > 0) setBizImpactCards(mappedBiz);
    setSignalsCatalog(catalog);
    setEngineSigOrder(buildSigOrderFromEngine(catalog, items, displayOrderIds));
    const hasRealSignals = Object.keys(catalog).some((k) => !k.startsWith('func_'));
    return { ok: hasRealSignals, merged: catalog, displayOrderIds };
  }, []);

  useEffect(() => {
    if (authStatus !== 'dashboard') return undefined;
    let cancelled = false;
    (async () => {
      const settled = await Promise.allSettled([getSignals(), getBizImpactCards(), getSignalsDisplayOrder()]);
      if (cancelled) return;

      const errs = [];
      const orderRaw = settled[2].status === 'fulfilled' ? settled[2].value : null;
      const displayOrderIds = orderRaw ? mapDisplayOrderFromApi(orderRaw) : null;

      let sigItems = [];
      if (settled[0].status === 'fulfilled') {
        const sigRes = settled[0].value;
        sigItems = getSignalsListItems(sigRes);
      } else {
        errs.push(`Signals: ${settled[0].reason?.message || settled[0].reason}`);
      }

      let mappedBiz = null;
      if (settled[1].status === 'fulfilled') {
        mappedBiz = mapBizImpactCardsResponse(settled[1].value);
        if (mappedBiz && mappedBiz.length > 0) setBizImpactCards(mappedBiz);
        else {
          setBizImpactCards([]);
          errs.push(
            'Biz-impact API returned no cards. In Network → cards → Response, confirm a non-empty `cards` or `data` array.'
          );
        }
      } else {
        setBizImpactCards([]);
        errs.push(`Biz impact: ${settled[1].reason?.message || settled[1].reason}`);
      }

      let catalog = buildMinimalFunctionCatalog();
      if (sigItems.length > 0) {
        catalog = mergeSignalsFromEngineResponse({ data: sigItems });
      }
      catalog = hydrateCatalogFromBizCards(catalog, mappedBiz || []);
      catalog = hydrateCatalogFromDisplayOrder(catalog, displayOrderIds);
      setSignalsCatalog(catalog);
      setEngineSigOrder(buildSigOrderFromEngine(catalog, sigItems, displayOrderIds));

      const nonFuncIds = Object.keys(catalog).filter((k) => !k.startsWith('func_'));
      if (sigItems.length === 0 && nonFuncIds.length === 0) {
        errs.push(
          'No signals in the catalog: GET /signals had no list rows, and no signal ids were found in biz-impact breakdowns or display-order. Check Network responses for those endpoints.'
        );
      }

      if (errs.length) {
        const msg = errs.join(' ');
        setDataLoadError(msg);
        showToast(`Live data: ${errs[0]}`);
      } else {
        setDataLoadError(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  const handleRunOneSignal = useCallback(
    async (signalId) => {
      try {
        const runRes = await postSignalRun(signalId);
        setSignalsCatalog((prev) => applyRunResponseToCatalog(prev, runRes));
        showToast(runRes?.message || `${signalId} recomputed`);
      } catch (e) {
        showToast(e?.message || 'Could not run signal');
      }
    },
    [showToast]
  );

  const handleEvaluateAllSignals = useCallback(async () => {
    try {
      const res = await postSignalsEvaluateAll();
      setSignalsCatalog((prev) => applyEvaluateAllResponseToCatalog(prev, res));
      const { ok } = await reloadSignalsCatalog();
      const evaluated = res?.data?.evaluated ?? res?.count;
      const apiMsg = res?.message != null && String(res.message).trim() ? String(res.message).trim() : null;
      showToast(
        ok
          ? typeof evaluated === 'number'
            ? apiMsg
              ? `${apiMsg} (${evaluated} evaluated)`
              : `All signals evaluated (${evaluated})`
            : apiMsg || (res?.success ? 'Signals refreshed' : 'Evaluate complete')
          : 'Evaluate finished — list still empty; check GET /signals'
      );
    } catch (e) {
      showToast(e?.message || 'Evaluate all failed');
    }
  }, [reloadSignalsCatalog, showToast]);

  /** Dashboard extras from Signal Engine (non-blocking). */
  useEffect(() => {
    if (authStatus !== 'dashboard') return undefined;
    let cancelled = false;
    (async () => {
      const safe = (p) => p.catch(() => null);
      const [rc, eb, ebOverlay, risk, hl, prompts, heat, boot, tenant, dsync, meRaw, health, rootMeta] =
        await Promise.all([
          safe(getRisksChanged()),
          safe(getExecutiveBrief()),
          safe(getExecutiveBriefOverlay()),
          safe(getDashboardRiskExposure()),
          safe(getDashboardBriefHighlights()),
          safe(getAskMexiSuggestedPrompts()),
          safe(getHeatmapAll()),
          safe(getBootstrap()),
          safe(getTenant()),
          safe(getDataSyncStatus()),
          safe(getEngineMe()),
          safe(getEngineHealth()),
          safe(getSignalEngineRoot()),
        ]);
      if (cancelled) return;
      if (import.meta.env.DEV) {
        if (health && typeof health === 'object') console.info('[Signal Engine] GET /api/v1/health', health);
        if (rootMeta && typeof rootMeta === 'object') console.info('[Signal Engine] GET / (root)', rootMeta);
      }
      const mappedTenant = tenant ? mapTenantFromApi(tenant) : null;
      if (mappedTenant) setEngineTenant(mappedTenant);
      const mappedBoot = boot ? mapBootstrapFromApi(boot) : null;
      if (mappedBoot) setEngineBootstrap(mappedBoot);
      const mappedSync = dsync ? mapDataSyncFromApi(dsync) : null;
      if (mappedSync) setEngineDataSync(mappedSync);
      const mappedMe = meRaw ? mapEngineMeFromApi(meRaw) : null;
      if (mappedMe) setEngineMe(mappedMe);
      const mappedRc = rc ? mapRisksChangedFromApi(rc) : null;
      setRisksChangedItems(mappedRc?.length ? mappedRc : null);
      const briefText = (x) => {
        if (!x || typeof x !== 'object') return null;
        const t = x.content ?? x.body ?? x.text ?? x.data?.content;
        return typeof t === 'string' && t.trim() ? t.trim() : null;
      };
      const content = briefText(eb) ?? briefText(ebOverlay);
      if (content) setExecBriefContent(content);
      else setExecBriefContent(null);
      const rv = risk?.value ?? risk?.exposure ?? risk?.total ?? risk?.data?.value;
      if (rv != null && String(rv).trim()) setRiskExposureOverride(String(rv).trim());
      const br = hl ? mapBriefHighlightsToBriefRows(hl) : null;
      if (br?.length) setBriefOverride(br);
      const pr = prompts ? mapSuggestedPromptsFromApi(prompts) : null;
      if (pr?.length) setAskPromptsOverride(pr);
      const ht = heat ? mapHeatmapToTiles(heat) : null;
      if (ht?.length) setHealthTiles(ht);
    })();
    return () => {
      cancelled = true;
    };
  }, [
    authStatus,
    setExecBriefContent,
    setEngineTenant,
    setEngineBootstrap,
    setEngineDataSync,
    setEngineMe,
  ]);

  /** Load GET what/why/impact/actions together when a real signal opens (API-only; missing → —). */
  useEffect(() => {
    if (authStatus !== 'dashboard' || !currentPanelSig || String(currentPanelSig).startsWith('func_')) {
      return undefined;
    }
    let cancelled = false;
    const sigId = currentPanelSig;

    (async () => {
      try {
        const [detailRes, rawWhat, rawWhy, rawImpact, rawActs] = await Promise.all([
          getSignalById(sigId).catch(() => null),
          getSignalWhat(sigId).catch(() => ({})),
          getSignalWhy(sigId).catch(() => ({})),
          getSignalImpactTab(sigId).catch(() => ({})),
          getSignalActions(sigId).catch(() => ({})),
        ]);
        if (cancelled) return;
        const wDoc = rawWhat && typeof rawWhat === 'object' ? rawWhat : {};
        const yDoc = rawWhy && typeof rawWhy === 'object' ? rawWhy : {};
        const iDoc = rawImpact && typeof rawImpact === 'object' ? rawImpact : {};
        const aDoc = rawActs && typeof rawActs === 'object' ? rawActs : {};
        setSignalsCatalog((prev) => {
          const base = detailRes ? applyRunResponseToCatalog(prev, detailRes) : prev;
          const cur = base[sigId] || {};
          const { why, hyps } = mapWhyFromApi(yDoc, cur);
          return {
            ...base,
            [sigId]: {
              ...cur,
              what: mapWhatFromApi(wDoc),
              why,
              hyps: Array.isArray(hyps) ? hyps : [],
              fvla: mapFvlaFromApi(iDoc),
              acts: mapActsFromApi(aDoc),
            },
          };
        });
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[Signal intelligence]', sigId, e?.message || e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authStatus, currentPanelSig]);

  /** Load GET /signals/heatmap/{segment} when a function overview panel opens (func_*). */
  useEffect(() => {
    if (authStatus !== 'dashboard' || !currentPanelSig || !String(currentPanelSig).startsWith('func_')) {
      return undefined;
    }
    const path = HEATMAP_PATH_BY_PANEL[currentPanelSig];
    if (!path) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const raw = await getHeatmapFunction(path).catch(() => null);
        if (cancelled || !raw || typeof raw !== 'object') return;
        const patch = mapHeatmapDetailToCatalogEntry(raw, currentPanelSig);
        if (!patch) return;
        setSignalsCatalog((prev) => {
          const base = prev[currentPanelSig] || createEmptySignalEntry(currentPanelSig);
          return {
            ...prev,
            [currentPanelSig]: { ...base, ...patch },
          };
        });
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[Heatmap detail]', currentPanelSig, e?.message || e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authStatus, currentPanelSig]);

  const openPanel = (sigId, tab = 'what', originId = null) => {
    setActiveBizCard(null);
    setOriginBizCard(originId); // explicitly set origin (null for direct clicks)
    setCurrentPanelSig(sigId);
    setPanelTab(tab);
    setPanelMode('expanded');
  };

  const handleOpenBizCard = (cardId) => {
    setPanelMode('hidden');
    setOriginBizCard(null); // Clear origin when explicitly opening a card
    setActiveBizCard(cardId);
  };

  const closePanel = () => {
    setCurrentPanelSig(null);
    setPanelMode('hidden');
  };

  const togglePanelMode = () => {
    if (currentPanelSig) setFsOverlayOpen(true);
  };

  const followFromChat = (sigId) => {
    const sig = signalsCatalog[sigId];
    if (!sig) return;
    const label = (sig.name && String(sig.name).trim()) || String(sigId);
    const mapped = { id: label.slice(0, 40), type: 'Signal' };

    const entity = {
      id: mapped.id,
      type: mapped.type,
      status: sig.sev === 'r' ? 'r' : 'a',
      statusLabel: sig.sev === 'r' ? 'Critical' : 'Warning',
      sig: sigId
    };

    setWatchlist((prev) => {
      if (prev.find((w) => w.sig === sigId)) {
        showToast(`${entity.id} is already in your Watchlist`);
        return prev;
      }
      const next = [...prev, entity];
      (async () => {
        try {
          await postEngineMeWatchlistItem({ signal_id: sigId, signal_name: entity.id });
        } catch {
          await syncWatchlistToEngine(next);
        }
      })();
      showToast(`+ Following: ${entity.id}`);
      return next;
    });
  };

  const unfollowEntity = (index) => {
    setWatchlist((prev) => {
      const next = prev.filter((_, i) => i !== index);
      syncWatchlistToEngine(next);
      return next;
    });
    showToast('Removed from watchlist');
  };

  const roleData = useMemo(() => {
    const base = ROLES[currentRole];
    return {
      ...base,
      ...(riskExposureOverride ? { recTotal: riskExposureOverride } : {}),
      ...(Array.isArray(briefOverride) && briefOverride.length ? { brief: briefOverride } : {}),
      ...(Array.isArray(askPromptsOverride) && askPromptsOverride.length ? { chips: askPromptsOverride } : {}),
    };
  }, [currentRole, riskExposureOverride, briefOverride, askPromptsOverride]);

  // Calculate left/right panel widths for shell layout
  const leftW = leftPanelOpen ? '340px' : '0px';
  const rightW = (panelMode === 'expanded' || activeBizCard) ? '480px' : '0px';

  if (authStatus === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={(email) => {
          setUserEmail(email);
          setAuthStatus('loading');
        }} 
        onGoToSignup={() => setAuthStatus('signup')}
      />
    );
  }

  if (authStatus === 'signup') {
    return (
      <SignupPage 
        onSignupSuccess={(email) => {
          setUserEmail(email);
          setAuthStatus('loading');
        }} 
        onGoToLogin={() => setAuthStatus('login')}
        onRegistered={() => showToast('Account created. Please sign in.')}
      />
    );
  }

  if (authStatus === 'loading') {
    return <LoadingScreen controlled />;
  }

  // Fade-in effect for dashboard
  const dashboardStyle = {
    animation: 'fadeUp 0.6s ease',
    opacity: 1,
    gridTemplateColumns: `${leftW} 1fr ${rightW}`,
    marginTop: dataLoadError ? '52px' : undefined,
  };

  return (
    <>
      {dataLoadError && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            padding: '10px 16px',
            fontSize: '12px',
            lineHeight: 1.45,
            background: 'var(--critical-bg, #3d1515)',
            color: 'var(--critical, #ff6b6b)',
            borderBottom: '1px solid var(--critical-bd, #8b2a2a)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span>
            <strong>Live signal data</strong> — {dataLoadError} Open DevTools → Network → the failing{' '}
            <code style={{ fontSize: '11px' }}>/api/v1/…</code> request → Response.{' '}
            <strong>502/503</strong> = proxy cannot reach the API process; <strong>500</strong> = app error (logs/DB). Not the React mock.
          </span>
          <button
            type="button"
            onClick={() => setDataLoadError(null)}
            style={{
              flexShrink: 0,
              background: 'transparent',
              border: '1px solid currentColor',
              color: 'inherit',
              borderRadius: 6,
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Dismiss
          </button>
        </div>
      )}
      <div className={`shell ${!leftPanelOpen ? 'no-panel' : ''} ${(panelMode === 'expanded' || activeBizCard) ? 'panel-expanded' : ''}`} id="shell" style={dashboardStyle}>

        <Topbar
          leftPanelOpen={leftPanelOpen}
          toggleLeftPanel={() => setLeftPanelOpen(!leftPanelOpen)}
          showToast={showToast}
          openSettings={() => setSettingsOpen(true)}
          openProfile={() => setProfileOpen(true)}
          tenantClientName={engineTenant?.displayName}
          tenantLogoUrl={engineTenant?.logoUrl}
          engineBootstrap={engineBootstrap}
          engineDataSync={engineDataSync}
          engineProfile={engineMe}
          onSignOut={async () => {
            try {
              await logout();
            } catch {
              authService.clearTokens();
            }
            setUserEmail('');
            setSignalsCatalog(buildMinimalFunctionCatalog());
            setBizImpactCards([]);
            setEngineSigOrder(null);
            setDataLoadError(null);
            setRisksChangedItems(null);
            setHealthTiles(null);
            setAskPromptsOverride(null);
            setBriefOverride(null);
            setRiskExposureOverride(null);
            setExecBriefContent(null);
            setEngineTenant(null);
            setEngineBootstrap(null);
            setEngineDataSync(null);
            setEngineMe(null);
            setWatchlist([]);
            try {
              localStorage.removeItem('mexi_watchlist');
            } catch {
              /* ignore */
            }
            setAuthStatus('login');
          }}
        />

        <LeftPanel
          leftPanelOpen={leftPanelOpen}
          roleData={roleData}
          SIGNALS={signalsCatalog}
          openPanel={openPanel}
          showToast={showToast}
          openBrief={() => { setShowExecBrief(true); showToast('Opening Executive Brief...'); }}
          openAllSignalsPanel={() => setAllSignalsOpen(true)}
          openBizCard={handleOpenBizCard}
          watchlist={watchlist}
          unfollowEntity={unfollowEntity}
          bizImpactCards={bizImpactCards}
          sigOrder={engineSigOrder}
          risksChangedItems={risksChangedItems}
          healthTiles={healthTiles}
        />

        <main className="center-col">
          <AskMexi
            roleData={roleData}
            showToast={showToast}
            openPanel={openPanel}
            followFromChat={followFromChat}
            SIGNALS={signalsCatalog}
            chatInputTrigger={chatInputTrigger}
            setChatInputTrigger={setChatInputTrigger}
            chatGreetingName={engineMe?.greetingName}
          />
        </main>

        {/* Dynamic Right Panel Space */}
        {activeBizCard ? (
          <BizImpactDrawer
            cardId={activeBizCard}
            SIGNALS={signalsCatalog}
            bizImpactCards={bizImpactCards}
            onClose={() => setActiveBizCard(null)}
            openPanel={(sigId, tab, originId) => { setActiveBizCard(null); openPanel(sigId, tab, originId); }}
          />
        ) : (
          <IntelligencePanel
            key={`${currentPanelSig}-${originBizCard}`}
            currentPanelSig={currentPanelSig}
            panelMode={panelMode}
            activeTab={panelTab}
            setActiveTab={setPanelTab}
            SIGNALS={signalsCatalog}
            closePanel={closePanel}
            togglePanelMode={togglePanelMode}
            showToast={showToast}
            followFromChat={followFromChat}
            setChatInputTrigger={setChatInputTrigger}
            originBizCard={originBizCard}
            onBackToBiz={handleOpenBizCard}
            bizImpactCards={bizImpactCards}
            askChips={roleData.chips}
          />
        )}
        
        <ExecBriefModal />
      </div>

      {!leftPanelOpen && (
        <div className="panel-expand-btn" style={{ display: 'flex' }} onClick={() => setLeftPanelOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
        </div>
      )}

      {/* Removed BizImpactDrawer from overlay level */}

      {/* OVERLAYS */}
      <AllSignalsOverlay
        isOpen={allSignalsOpen}
        onClose={() => setAllSignalsOpen(false)}
        roleData={roleData}
        sigOrder={engineSigOrder}
        SIGNALS={signalsCatalog}
        openPanel={openPanel}
        onRunSignal={handleRunOneSignal}
        onEvaluateAll={handleEvaluateAllSignals}
      />

      <SettingsOverlay
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        showToast={showToast}
      />

      <ProfileOverlay
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        showToast={showToast}
        userEmail={userEmail}
        engineProfile={engineMe}
      />

      {/* Full-Screen Overlay for Intelligence Panel */}
      {fsOverlayOpen && currentPanelSig && (
        <div className="ip-fullscreen-overlay open" onClick={() => setFsOverlayOpen(false)}>
          <div className="ip-fullscreen-card" onClick={e => e.stopPropagation()}>
            <div className="ip-hdr" style={{ flexShrink: 0, padding: '16px 20px' }}>
              <div className="ip-hdr-top">
                <div className="ip-hdr-left">
                  <div className="ip-sig-id" style={{fontSize:'12px', color:'var(--primary)'}}>{currentPanelSig} · {signalsCatalog[currentPanelSig]?.proc}</div>
                  <div className="ip-sig-name" style={{fontSize:'20px', fontWeight:700}}>{signalsCatalog[currentPanelSig]?.name}</div>
                </div>
                <div className="ip-hdr-actions">
                  <div className="ip-close-btn" onClick={() => setFsOverlayOpen(false)} style={{width:'32px', height:'32px', fontSize:'16px'}}>✕</div>
                </div>
              </div>
              <div className="ip-tabs" style={{marginTop:'12px'}}>
                {['what', 'why', 'impact', 'actions', 'ask'].map(tab => (
                  <div key={tab} className={`ip-tab ${panelTab === tab ? 'active' : ''}`} onClick={() => setPanelTab(tab)}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            <div style={{flex:1, overflowY:'auto', padding:'4px 20px 20px'}}>
              <IPContent 
                activeTab={panelTab}
                sig={signalsCatalog[currentPanelSig]}
                currentPanelSig={currentPanelSig}
                showToast={showToast}
                followFromChat={followFromChat}
                setActiveTab={setPanelTab}
                setChatInputTrigger={setChatInputTrigger}
                askChips={roleData.chips}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`toast ${toastMsg ? 'show' : ''}`} id="toast" style={{ opacity: toastMsg ? 1 : 0 }}>
        {toastMsg}
      </div>
    </>
  );
}
