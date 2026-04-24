import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CurrentStationBadge } from './components/CurrentStationBadge';
import { DirectionBadge } from './components/DirectionBadge';
import { RouteBadge } from './components/RouteBadge';
import { StationFormModal, stationToDraft, type StationFormDraft } from './components/StationFormModal';
import { StationTable } from './components/StationTable';
import {
  deleteStation,
  insertStation,
  setCurrentStation,
  setDirection,
  setIdColor,
  setLineId,
  setTotalLength,
  updateStation,
  type GeneratorState,
  type StationItem,
  type TransferLine,
} from './features/generatorSlice';
import { useAppDispatch, useAppSelector } from './hooks';

type ModalState =
  | {
      kind: 'create';
      position: 'before' | 'after' | 'start' | 'end';
      basisId?: string;
    }
  | {
      kind: 'edit';
      station: StationItem;
    }
  | null;

type ThemeMode = 'light' | 'dark';

const themeStorageKey = 'site-theme';
const svgExportComment = '<!-- created by njmetro-railmap-creator, (https://github.com/unnamed2964/njmetro-railmap-creator) -->';
const docsReferenceUrl = 'https://github.com/Unnamed2964/njmetro-railmap-creator/tree/main/docs';
const sampleImages = [
  {
    title: '终点站示例',
    description: '线路标识与 Terminus 贴纸',
    src: new URL('../docs/svgs/terminus.svg', import.meta.url).href,
  },
  {
    title: '方向贴纸示例',
    description: '往某站 / 下一站 组合样式',
    src: new URL('../docs/svgs/to xxx, next station xxx.svg', import.meta.url).href,
  },
  {
    title: '路线图示例',
    description: '含当前站、换乘与后续站点的线路图',
    src: new URL('../docs/svgs/route2.svg', import.meta.url).href,
  },
] as const;

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyThemeMode = (themeMode: ThemeMode) => {
  document.documentElement.classList.toggle('dark', themeMode === 'dark');
  document.documentElement.style.colorScheme = themeMode;
};

const sanitizeTransfer = (value: TransferLine[]): TransferLine[] =>
  value
    .map((entry) => ({
      id: entry.id.trim(),
      color: /^#[0-9a-fA-F]{6}$/.test(entry.color) ? entry.color : '#8c989f',
    }))
    .filter((entry) => entry.id.length > 0);

const toStationItem = (draft: StationFormDraft, id: string): StationItem => ({
  id,
  chName: draft.chName.trim(),
  enName: draft.enName.trim(),
  transfer: sanitizeTransfer(draft.transfer),
});

type DownloadableBadgeCardProps = {
  title: string;
  fileName: string;
  children: ReactNode;
};

const DownloadableBadgeCard = ({ title, fileName, children }: DownloadableBadgeCardProps) => {
  const badgeContainerRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = () => {
    const svgElement = badgeContainerRef.current?.querySelector('svg');

    if (!svgElement) {
      return;
    }

    const serializer = new XMLSerializer();
    const svgMarkup = `${svgExportComment}\n${serializer.serializeToString(svgElement)}`;
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = window.URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');

    downloadLink.href = objectUrl;
    downloadLink.download = fileName;
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  return (
    <div className="result-block">
      <h3>{title}</h3>
      <div ref={badgeContainerRef} className="badge-preview">
        {children}
      </div>
      <div className="result-actions">
        <button type="button" className="secondary-button" onClick={handleDownload}>
          下载 SVG
        </button>
      </div>
    </div>
  );
};

function App() {
  const dispatch = useAppDispatch();
  const generator = useAppSelector((state) => state.generator);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [submittedData, setSubmittedData] = useState<GeneratorState>(generator);
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);

  useEffect(() => {
    const initialThemeMode = getInitialThemeMode();
    setThemeMode(initialThemeMode);
    applyThemeMode(initialThemeMode);
  }, []);

  const openInsertModal = (position: 'before' | 'after' | 'start' | 'end') => {
    setModalState({
      kind: 'create',
      position,
      basisId: position === 'before' || position === 'after' ? generator.currentStnId : undefined,
    });
  };

  const handleModalSubmit = (draft: StationFormDraft) => {
    if (modalState?.kind === 'edit') {
      dispatch(updateStation(toStationItem(draft, modalState.station.id)));
    }

    if (modalState?.kind === 'create') {
      const nextId = `station-${crypto.randomUUID()}`;
      dispatch(
        insertStation({
          position: modalState.position,
          basisId: modalState.basisId,
          station: toStationItem(draft, nextId),
        }),
      );
    }

    setModalState(null);
  };

  const handleThemeToggle = () => {
    const nextThemeMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextThemeMode);
    window.localStorage.setItem(themeStorageKey, nextThemeMode);
    applyThemeMode(nextThemeMode);
  };

  const currentStation = generator.stnList.find((station) => station.id === generator.currentStnId);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div className="page-meta-row">
          <p className="eyebrow">Nanjing Metro Prototype</p>
          <button
            className="theme-toggle"
            type="button"
            onClick={handleThemeToggle}
            aria-label={themeMode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          >
            {themeMode === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          </button>
        </div>
        <h1>南京地铁屏蔽门上方贴纸生成器（Alpha）</h1>
        <p className="lead">用于演示 SVG 输出骨架</p>
        <div className="docs-callout">
          <strong>参考资料与推导过程</strong>
          <p>
            参考资料、尺寸记录与推导过程见
            {' '}
            <a href={docsReferenceUrl} target="_blank" rel="noreferrer">
              docs/
            </a>
            。
          </p>
        </div>
        <div className="inline-links" aria-label="外部链接">
          <a href="https://github.com/unnamed2964/njmetro-railmap-creator" target="_blank" rel="noreferrer">
            GitHub 仓库
          </a>
          <a href={docsReferenceUrl} target="_blank" rel="noreferrer">
            参考资料（docs/）
          </a>
          <a href="https://umamichi.moe/" target="_blank" rel="noreferrer">
            个人网站
          </a>
          <button type="button" className="example-trigger" onClick={() => setIsExampleModalOpen(true)}>
            查看示例
          </button>
        </div>
      </header>

      <section className="panel">
        <h2>待办事项</h2>
        <ul>
          <li>处理不同字体情况下的兼容</li>
        </ul>
      </section>

      <section className="panel">
        <h2>生成设置</h2>
        <div className="form-grid single-column">
          <label>
            <span>totalLength（总长（px））</span>
            <input
              type="number"
              min={0}
              step={1}
              value={generator.totalLength}
              onChange={(event) => dispatch(setTotalLength(Number(event.target.value) || 0))}
            />
          </label>
          <label>
            <span>direction（列车行进方向）</span>
            <select value={generator.direction} onChange={(event) => dispatch(setDirection(event.target.value as 'l' | 'r'))}>
              <option value="l">l</option>
              <option value="r">r</option>
            </select>
          </label>
          <label>
            <span>lineId（线路编号）</span>
            <input type="text" value={generator.lineId} onChange={(event) => dispatch(setLineId(event.target.value.trim().toUpperCase()))} />
          </label>
          <label>
            <span>idColor（线路标识色）</span>
            <input type="color" value={generator.idColor} onChange={(event) => dispatch(setIdColor(event.target.value))} />
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>站点列表</h2>
          </div>
        </div>

        <StationTable
          currentStnId={generator.currentStnId}
          stations={generator.stnList}
          onEdit={(station) => setModalState({ kind: 'edit', station })}
          onInsert={openInsertModal}
          onSelect={(stationId) => dispatch(setCurrentStation(stationId))}
        />

        <br />

        <button type="button" className="primary-button submit-button" onClick={() => setSubmittedData(generator)}>
          提交
        </button>
      </section>

      <section className="panel result-panel">
        <h2>结果</h2>

        <DownloadableBadgeCard title="CurrentStationBadge" fileName="current-station-badge.svg">
          <CurrentStationBadge data={submittedData} />
        </DownloadableBadgeCard>

        <DownloadableBadgeCard title="DirectionBadge" fileName="direction-badge.svg">
          <DirectionBadge data={submittedData} />
        </DownloadableBadgeCard>

        <DownloadableBadgeCard title="RouteBadge" fileName="route-badge.svg">
          <RouteBadge data={submittedData} />
        </DownloadableBadgeCard>
      </section>

      {modalState ? (
        <StationFormModal
          allowDelete={modalState.kind === 'edit'}
          initialValue={modalState.kind === 'edit' ? stationToDraft(modalState.station) : stationToDraft()}
          modeLabel={modalState.kind === 'edit' ? '编辑站点' : '新增站点'}
          onClose={() => setModalState(null)}
          onDelete={
            modalState.kind === 'edit'
              ? () => {
                  dispatch(deleteStation(modalState.station.id));
                  setModalState(null);
                }
              : undefined
          }
          onSubmit={handleModalSubmit}
        />
      ) : null}

      {isExampleModalOpen ? (
        <div className="example-modal-backdrop" role="presentation" onClick={() => setIsExampleModalOpen(false)}>
          <section
            className="example-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="example-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="example-modal-header">
              <div>
                <h2 id="example-modal-title">参考样例</h2>
                <p className="panel-subtitle">以下图片来自 docs/svgs，仅用于版式参考，并非当前表单的实时输出。</p>
              </div>
              <button type="button" className="icon-button" aria-label="关闭示例浮窗" onClick={() => setIsExampleModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="example-gallery">
              {sampleImages.map((sample) => (
                <figure key={sample.title} className="example-card">
                  <img src={sample.src} alt={sample.title} loading="lazy" />
                  <figcaption>
                    <strong>{sample.title}</strong>
                    <span>{sample.description}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default App;
