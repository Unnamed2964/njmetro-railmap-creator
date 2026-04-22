import { useState } from 'react';
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

function App() {
  const dispatch = useAppDispatch();
  const generator = useAppSelector((state) => state.generator);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [submittedData, setSubmittedData] = useState<GeneratorState>(generator);

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

  const currentStation = generator.stnList.find((station) => station.id === generator.currentStnId);

  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Nanjing Metro Prototype</p>
        <h1>南京地铁屏蔽门上方贴纸生成器（Alpha）</h1>
        <p className="lead">用于演示 SVG 输出骨架</p>
      </header>

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

        <div className="result-block">
          <h3>CurrentStationBadge</h3>
          <CurrentStationBadge data={submittedData} />
        </div>

        <div className="result-block">
          <h3>DirectionBadge</h3>
          <DirectionBadge data={submittedData} />
        </div>

        <div className="result-block">
          <h3>RouteBadge</h3>
          <RouteBadge data={submittedData} />
        </div>
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
    </main>
  );
}

export default App;
