import React, { useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Monitor, Server, Database, Sparkles, Cloud, Cpu } from 'lucide-react';

const getNodeStyle = (type) => {
  switch (type) {
    case 'client':
      return {
        bg: 'bg-indigo-950/80',
        border: 'border-indigo-500',
        glow: 'shadow-indigo-500/20',
        icon: Monitor,
        accent: 'text-indigo-400',
      };
    case 'api':
      return {
        bg: 'bg-cyan-950/80',
        border: 'border-cyan-500',
        glow: 'shadow-cyan-500/20',
        icon: Server,
        accent: 'text-cyan-400',
      };
    case 'database':
      return {
        bg: 'bg-emerald-950/80',
        border: 'border-emerald-500',
        glow: 'shadow-emerald-500/20',
        icon: Database,
        accent: 'text-emerald-400',
      };
    case 'ai':
      return {
        bg: 'bg-purple-950/80',
        border: 'border-purple-500',
        glow: 'shadow-purple-500/20',
        icon: Sparkles,
        accent: 'text-purple-400',
      };
    case 'hardware':
      return {
        bg: 'bg-amber-950/80',
        border: 'border-amber-500',
        glow: 'shadow-amber-500/20',
        icon: Cpu,
        accent: 'text-amber-400',
      };
    default:
      return {
        bg: 'bg-slate-900/90',
        border: 'border-slate-700',
        glow: 'shadow-slate-500/10',
        icon: Cloud,
        accent: 'text-slate-400',
      };
  }
};

function CustomArchitectureNode({ data }) {
  const meta = getNodeStyle(data.type);
  const Icon = meta.icon;

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 ${meta.bg} ${meta.border} shadow-lg ${meta.glow} backdrop-blur-md min-w-[190px] text-left transition-all`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className={`p-1.5 rounded-lg bg-slate-950/80 ${meta.accent}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block leading-tight">
            {data.type || 'Service'}
          </span>
          <span className="text-xs font-semibold text-white leading-tight block">
            {data.label}
          </span>
        </div>
      </div>
      {data.tech && (
        <div className="mt-1">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/50 text-indigo-300 border border-indigo-900/50">
            {data.tech}
          </span>
        </div>
      )}
      {data.description && (
        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
          {data.description}
        </p>
      )}
    </div>
  );
}

export default function ArchitectureFlow({ architectureData }) {
  const nodeTypes = useMemo(() => ({ default: CustomArchitectureNode }), []);

  // Format nodes
  const initialNodes = useMemo(() => {
    if (!architectureData?.nodes?.length) return [];
    return architectureData.nodes.map((node, i) => ({
      id: node.id || `node-${i}`,
      position: node.position || { x: 100 + (i % 3) * 220, y: 50 + Math.floor(i / 3) * 160 },
      data: {
        label: node.label,
        type: node.type,
        tech: node.tech,
        description: node.description,
      },
    }));
  }, [architectureData]);

  // Format edges
  const initialEdges = useMemo(() => {
    if (!architectureData?.edges?.length) return [];
    return architectureData.edges.map((edge, i) => ({
      id: edge.id || `edge-${i}`,
      source: edge.source,
      target: edge.target,
      label: edge.label || '',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#6366f1',
      },
      labelStyle: { fill: '#cbd5e1', fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: '#090d16', fillOpacity: 0.8 },
      labelBgPadding: [4, 4],
      labelBgBorderRadius: 4,
    }));
  }, [architectureData]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  if (!architectureData || !architectureData.nodes?.length) {
    return (
      <div className="p-8 text-center text-slate-500">
        Architecture nodes have not yet been generated.
      </div>
    );
  }

  return (
    <div className="w-full h-[520px] rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden relative">
      {architectureData.overview && (
        <div className="absolute top-3 left-3 z-10 max-w-md p-3 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg pointer-events-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-0.5">
            Architecture Blueprint
          </span>
          <p className="text-xs text-slate-300">{architectureData.overview}</p>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Controls className="!bg-slate-900 !border-slate-800 !text-white !fill-white" />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-slate-900/80 !border-slate-800 rounded-lg hidden sm:block"
          nodeColor={(n) => {
            if (n.data?.type === 'client') return '#6366f1';
            if (n.data?.type === 'api') return '#06b6d4';
            if (n.data?.type === 'database') return '#10b981';
            if (n.data?.type === 'ai') return '#a855f7';
            return '#64748b';
          }}
        />
        <Background color="#1e293b" gap={18} size={1} />
      </ReactFlow>
    </div>
  );
}
