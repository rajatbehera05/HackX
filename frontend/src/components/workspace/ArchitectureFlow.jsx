import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Monitor, Server, Database, Sparkles, Cloud, Cpu } from 'lucide-react';

const getNodeMeta = (type) => {
  switch (type?.toLowerCase()) {
    case 'client':
    case 'frontend':
      return {
        tag: 'CLIENT',
        tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        borderColor: 'border-blue-500/40',
        icon: Monitor,
      };
    case 'api':
    case 'server':
    case 'backend':
      return {
        tag: 'API SERVICE',
        tagColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
        borderColor: 'border-sky-500/40',
        icon: Server,
      };
    case 'database':
    case 'storage':
      return {
        tag: 'DATA STORE',
        tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        borderColor: 'border-emerald-500/40',
        icon: Database,
      };
    case 'ai':
    case 'ml':
    case 'llm':
      return {
        tag: 'AI ENGINE',
        tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        borderColor: 'border-purple-500/40',
        icon: Sparkles,
      };
    case 'hardware':
    case 'iot':
    case 'sensor':
      return {
        tag: 'HARDWARE / IOT',
        tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        borderColor: 'border-amber-500/40',
        icon: Cpu,
      };
    default:
      return {
        tag: 'SERVICE',
        tagColor: 'text-slate-400 bg-slate-800 border-slate-700',
        borderColor: 'border-slate-700',
        icon: Cloud,
      };
  }
};

function TechnicalArchitectureNode({ data }) {
  const meta = getNodeMeta(data.type);
  const Icon = meta.icon;

  return (
    <div
      className={`w-[220px] rounded-md bg-[#111622] border ${meta.borderColor} shadow-sm text-left transition-colors relative overflow-hidden`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-blue-400 !border-[#0b0f17]"
      />

      {/* Header bar */}
      <div className="px-3 py-2 border-b border-[#1e2638] bg-[#0d121c] flex items-center justify-between">
        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${meta.tagColor}`}>
          {meta.tag}
        </span>
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>

      {/* Body */}
      <div className="p-3 space-y-1.5">
        <h5 className="text-xs font-semibold text-slate-100 leading-snug">
          {data.label}
        </h5>
        {data.tech && (
          <div className="text-[10px] font-mono text-blue-300 bg-[#161c2a] px-1.5 py-0.5 rounded border border-[#222c3f] inline-block">
            {data.tech}
          </div>
        )}
        {data.description && (
          <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">
            {data.description}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-blue-400 !border-[#0b0f17]"
      />
    </div>
  );
}

export default function ArchitectureFlow({ architectureData }) {
  const nodeTypes = useMemo(() => ({ default: TechnicalArchitectureNode }), []);

  // Format nodes with consistent spacing
  const initialNodes = useMemo(() => {
    if (!architectureData?.nodes?.length) return [];
    return architectureData.nodes.map((node, i) => ({
      id: node.id || `node-${i}`,
      position: node.position || {
        x: 60 + (i % 3) * 260,
        y: 40 + Math.floor(i / 3) * 160,
      },
      data: {
        label: node.label,
        type: node.type,
        tech: node.tech,
        description: node.description,
      },
    }));
  }, [architectureData]);

  // Format edges with clean arrows
  const initialEdges = useMemo(() => {
    if (!architectureData?.edges?.length) return [];
    return architectureData.edges.map((edge, i) => ({
      id: edge.id || `edge-${i}`,
      source: edge.source,
      target: edge.target,
      label: edge.label || '',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3b82f6',
        width: 16,
        height: 16,
      },
      labelStyle: { fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#0d121c', stroke: '#1e2638', strokeWidth: 1 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 2,
    }));
  }, [architectureData]);

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-md bg-[#111622] border border-[#1e2638] text-[11px] font-mono text-slate-400">
        <span className="text-slate-300 font-semibold">Service Typology:</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-blue-500" /> Client
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-sky-500" /> API / Server
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-emerald-500" /> Database
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-purple-500" /> AI / ML
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-amber-500" /> Hardware
          </span>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="h-[480px] w-full border border-[#1e2638] rounded-md overflow-hidden bg-[#0a0e16] relative">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.4}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e2638" gap={18} size={1} />
          <Controls className="!bg-[#111622] !border-[#1e2638] !fill-slate-300" />
          <MiniMap
            nodeColor={(node) => {
              const type = node.data?.type?.toLowerCase();
              if (type === 'client') return '#3b82f6';
              if (type === 'api' || type === 'server') return '#0284c7';
              if (type === 'database') return '#10b981';
              if (type === 'ai') return '#8b5cf6';
              if (type === 'hardware') return '#f59e0b';
              return '#475569';
            }}
            maskColor="rgba(11, 15, 23, 0.75)"
            className="!bg-[#0d121c] !border-[#1e2638] !rounded"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
