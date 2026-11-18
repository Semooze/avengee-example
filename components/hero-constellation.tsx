'use client';

import { useEffect, useRef } from 'react';
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceRadial,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import { showcases } from '@/components/showcase-data';

const W = 1000;
const H = 720;

type Kind = 'hub' | 'skill' | 'demo' | 'pointer';
type Node = SimulationNodeDatum & { id: string; kind: Kind; label?: string };
type Link = SimulationLinkDatum<Node> & { source: string | Node; target: string | Node };

const skills = [
  { id: 'strategy', label: 'Strategy' },
  { id: 'design', label: 'UX / UI' },
  { id: 'code', label: 'Engineering' },
  { id: 'systems', label: 'Systems' },
];

// Which capabilities each demo leans on; purely decorative wiring.
const demoSkills: Record<string, string[]> = {
  serein: ['design', 'code'],
  goodtime: ['design', 'strategy'],
  'still-house': ['design', 'code'],
  'good-neighbor': ['strategy', 'code'],
  'sunday-goods': ['design', 'systems'],
  'sunday-goods-erp': ['systems', 'code'],
};

const radius: Record<Kind, number> = { hub: 30, skill: 9, demo: 6, pointer: 0 };
const orbit: Record<Kind, number> = { hub: 0, skill: 130, demo: 260, pointer: 0 };

function buildGraph() {
  const nodes: Node[] = [
    { id: 'hub', kind: 'hub', fx: 0, fy: 0 },
    ...skills.map((skill) => ({ id: skill.id, kind: 'skill' as const, label: skill.label })),
    ...showcases.map((item) => ({ id: item.id, kind: 'demo' as const, label: item.name })),
    { id: 'pointer', kind: 'pointer', fx: 9999, fy: 9999 },
  ];
  const links: Link[] = [
    ...skills.map((skill) => ({ source: 'hub', target: skill.id })),
    ...showcases.flatMap((item) =>
      (demoSkills[item.id] ?? []).map((skill) => ({ source: skill, target: item.id })),
    ),
  ];
  // Seed on the orbit so the first frame already looks composed.
  nodes.forEach((node, index) => {
    const angle = (index / nodes.length) * Math.PI * 2;
    // Rounded so server and client render identical attributes.
    node.x = Math.round(Math.cos(angle) * orbit[node.kind]);
    node.y = Math.round(Math.sin(angle) * orbit[node.kind]);
  });
  return { nodes, links };
}

/**
 * The hero's living diagram: Avengee at the centre, its four capabilities in
 * the inner orbit and the six demos on the outside, laid out by d3-force.
 * The pointer pushes nodes away; the simulation sleeps while off screen.
 */
export function HeroConstellation() {
  const svgRef = useRef<SVGSVGElement>(null);
  const graph = useRef<ReturnType<typeof buildGraph>>(null!);
  graph.current ??= buildGraph();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const { nodes, links } = graph.current;
    const pointer = nodes.find((node) => node.kind === 'pointer')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const nodeEls = new Map<string, SVGGElement>();
    svg
      .querySelectorAll<SVGGElement>('[data-node]')
      .forEach((el) => nodeEls.set(el.dataset.node!, el));
    const linkEls = Array.from(svg.querySelectorAll<SVGLineElement>('[data-link]'));

    const draw = () => {
      for (const node of nodes) {
        nodeEls.get(node.id)?.setAttribute('transform', `translate(${node.x},${node.y})`);
      }
      links.forEach((link, index) => {
        const source = link.source as Node;
        const target = link.target as Node;
        const line = linkEls[index];
        line.setAttribute('x1', String(source.x));
        line.setAttribute('y1', String(source.y));
        line.setAttribute('x2', String(target.x));
        line.setAttribute('y2', String(target.y));
      });
    };

    const simulation = forceSimulation(nodes)
      .force(
        'link',
        forceLink<Node, Link>(links)
          .id((node) => node.id)
          .distance((link) => ((link.source as Node).kind === 'hub' ? 130 : 150))
          .strength(0.25),
      )
      .force(
        'charge',
        forceManyBody<Node>()
          .strength((node) => (node.kind === 'pointer' ? -900 : node.kind === 'hub' ? -400 : -160))
          .distanceMax(320),
      )
      .force(
        'orbit',
        forceRadial<Node>((node) => orbit[node.kind]).strength((node) =>
          node.kind === 'demo' ? 0.12 : 0.2,
        ),
      )
      .force(
        'collide',
        forceCollide<Node>((node) => radius[node.kind] + (node.label ? 34 : 6)),
      )
      .alphaDecay(0.03)
      .on('tick', draw);

    if (reduced) {
      simulation.stop();
      simulation.tick(240);
      draw();
      return () => void simulation.stop();
    }

    // A faint, constant drift keeps the diagram breathing.
    simulation.alphaTarget(0.015);

    let idle = 0;
    const toLocal = (event: PointerEvent) => {
      const matrix = svg.getScreenCTM();
      if (!matrix) return null;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      return point;
    };
    const host = svg.closest('section') ?? svg;
    const onMove = (event: Event) => {
      const point = toLocal(event as PointerEvent);
      if (!point) return;
      pointer.fx = point.x;
      pointer.fy = point.y;
      simulation.alphaTarget(0.12).restart();
      window.clearTimeout(idle);
      idle = window.setTimeout(() => simulation.alphaTarget(0.015), 600);
    };
    const onLeave = () => {
      pointer.fx = 9999;
      pointer.fy = 9999;
    };
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) simulation.restart();
      else simulation.stop();
    });
    observer.observe(svg);

    return () => {
      window.clearTimeout(idle);
      observer.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      simulation.stop();
    };
  }, []);

  const { nodes, links } = graph.current;
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const end = (ref: string | Node) => (typeof ref === 'string' ? byId.get(ref)! : ref);
  return (
    <svg
      ref={svgRef}
      className="constellation"
      viewBox={`${-W / 2} ${-H / 2} ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id="hub-glow">
          <stop offset="0%" stopColor="#6ea8ff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#6ea8ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="constellation-rings">
        <circle r={orbit.skill} />
        <circle r={orbit.demo} />
        <circle r={orbit.demo + 90} />
      </g>
      <g className="constellation-links">
        {links.map((link, index) => (
          <line
            key={index}
            data-link=""
            x1={end(link.source).x}
            y1={end(link.source).y}
            x2={end(link.target).x}
            y2={end(link.target).y}
            style={{ animationDelay: `${index * -0.7}s` }}
          />
        ))}
      </g>
      {nodes
        .filter((node) => node.kind !== 'pointer')
        .map((node) => (
          <g
            key={node.id}
            data-node={node.id}
            className={`c-node c-${node.kind}`}
            transform={`translate(${node.x},${node.y})`}
          >
            {node.kind === 'hub' ? (
              <>
                <circle r={110} fill="url(#hub-glow)" />
                <circle r={radius.hub} className="c-dot" />
                <text dy="0.35em">a</text>
              </>
            ) : (
              <>
                <circle r={radius[node.kind] + 8} className="c-halo" />
                <circle r={radius[node.kind]} className="c-dot" />
                <text y={radius[node.kind] + 20}>{node.label}</text>
              </>
            )}
          </g>
        ))}
    </svg>
  );
}
