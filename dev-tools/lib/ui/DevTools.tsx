import * as React from 'react';
import styled from 'styled-components';
import { IDevToolListener } from './types';
import Cell from './Cell';
import Field from './Field';
import { playStateColors, getPlayState } from './utils';

interface IProps {
  listeners: IDevToolListener[];
  className?: string;
}

const Wrapper = styled.article`
  background: #fff;
  display: flex;
`;

const Sidebar = styled.section`
  background: #353535;
  padding-top: 26px;
`;

const SidebarLabel = styled.div`
  display: block;
  font-size: 10px;
  white-space: nowrap;
  padding-top: 5px;
  margin: 0 5px 5px 5px;
`;

const SidebarValue = styled.div`
  font-size: 2vw;
  margin-bottom: 15px;
  font-weight: bold;
  text-align: right;
  margin: 5px;
  min-width: 10vw;
`;

const Table = styled.table`
  border-spacing: 0;
  width: 100%;
  font-size: 13px;
  text-align: left;
`;

const CostHighlight = styled.div<{ cost: number }>`
  background: ${({ cost }: { cost: number }) =>
    playStateColors[getPlayState(cost)]};
`;

const MemoCell = React.memo(Cell);
const FieldHead = styled(Field)`
  font-weight: bold;
  background: #353535;
  color: #eaeaea;
  height: 26px;
  box-sizing: border-box;
`;

export default function DevTools({ listeners, ...rest }: IProps) {
  const table = listeners.sort((a, b) => {
    return a.averageExecutionCost >= b.averageExecutionCost ? -1 : 1;
  });
  const lastExecCost = table.reduce(
    (sum, { lastExecutionCost }) => sum + lastExecutionCost,
    0,
  );
  return (
    <Wrapper {...rest}>
      <Table>
        <thead>
          <tr>
            <FieldHead>id</FieldHead>
            <FieldHead>Name</FieldHead>
            <FieldHead>Updates/ Skipped</FieldHead>
            <FieldHead>Ave. Exec. Cost</FieldHead>
            <FieldHead>Ave. Layout Cost</FieldHead>
            <FieldHead>Prio.</FieldHead>
          </tr>
        </thead>
        <tbody>
          {table.map((cell, index) => (
            <MemoCell key={cell.id} odd={index % 2 === 0} {...cell} />
          ))}
        </tbody>
      </Table>
      <Sidebar>
        <CostHighlight cost={lastExecCost}>
          <SidebarLabel>Exec. Cost (ms)</SidebarLabel>
          <SidebarValue>{lastExecCost.toFixed(1)}</SidebarValue>
          <SidebarLabel>fps</SidebarLabel>
          <SidebarValue>
            {Math.min(60, 1 / (lastExecCost / 1000)).toFixed(1)}
          </SidebarValue>
        </CostHighlight>
      </Sidebar>
    </Wrapper>
  );
}
