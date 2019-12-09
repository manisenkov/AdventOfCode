const {
  calcDist,
  createGraph,
  entries,
  fromEntries,
  joinGraphs,
  sum,
  values
} = require("../util");

const joinOrbitCounts = (orbitCounts1, orbitCounts2) => ({
  ...orbitCounts1,
  ...fromEntries(
    entries(orbitCounts2).map(([vertex, count]) => [
      vertex,
      (orbitCounts1[vertex] || 0) + count
    ])
  )
});

const calcOrbitCounts = (graph, start) =>
  [...(graph[start] || [])]
    .map(dest =>
      fromEntries([
        ...entries(calcOrbitCounts(graph, dest)).map(([vertex, orbitCount]) => [
          vertex,
          orbitCount + 1
        ]),
        [dest, 1]
      ])
    )
    .reduce(joinOrbitCounts, {});

exports.run = async input => {
  const edges = input.map(s => s.split(")"));

  const graph = createGraph(edges);
  const part1 = sum(values(calcOrbitCounts(graph, "COM")));

  // Revert graph nodes and join it with original one to create undirected version
  const undirectedGraph = joinGraphs(
    graph,
    createGraph(edges.map(([x, y]) => [y, x]))
  );
  const part2 = calcDist(undirectedGraph, "YOU", "SAN") - 2; // Minus hops from [YOU] and to [SAN] nodes

  return [part1, part2];
};