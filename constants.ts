
import { Snippet } from './types';

export const COLORS = {
  void: '#030005',
  neonViolet: '#7c3aed',
  magmaPink: '#db2777',
  cyan: '#06b6d4',
  success: '#10b981',
  error: '#ef4444',
  gold: '#fbbf24',
};

// Cyberpunk / Tech / Sci-Fi Word Bank for Infinite Generation
export const WORD_BANK = [
  "protocol", "neural", "synapse", "cipher", "daemon", "mainframe", "grid", "neon", "flux", "vector",
  "system", "override", "bypass", "matrix", "logic", "quantum", "shard", "pixel", "void", "echo",
  "binary", "hex", "root", "admin", "shell", "kernel", "buffer", "cache", "stack", "heap",
  "proxy", "node", "link", "uplink", "downlink", "server", "client", "host", "port", "socket",
  "encryption", "decryption", "hashing", "token", "auth", "access", "denied", "granted", "secure",
  "firewall", "breach", "intruder", "alert", "panic", "kernel", "bios", "cmos", "boot", "load",
  "compile", "runtime", "latency", "bandwidth", "throughput", "packet", "frame", "segment", "layer",
  "physical", "transport", "session", "network", "cloud", "fog", "edge", "compute", "storage",
  "silicon", "carbon", "fiber", "optic", "laser", "plasma", "fusion", "fission", "reactor", "core",
  "memory", "drive", "disk", "sector", "track", "cluster", "block", "file", "folder", "directory",
  "path", "route", "gateway", "subnet", "mask", "ip", "dns", "dhcp", "tcp", "udp",
  "http", "https", "ftp", "ssh", "ssl", "tls", "api", "rest", "soap", "json", "xml",
  "algorithm", "heuristic", "function", "variable", "constant", "array", "object", "class", "method",
  "loop", "recursion", "iteration", "pointer", "reference", "value", "type", "string", "integer",
  "float", "boolean", "null", "undefined", "nan", "infinity", "error", "exception", "throw", "catch",
  "try", "finally", "async", "await", "promise", "callback", "event", "listener", "handler", "dom",
  "browser", "window", "document", "element", "node", "attribute", "style", "css", "html", "javascript",
  "typescript", "python", "rust", "go", "cpp", "java", "ruby", "php", "sql", "nosql",
  "mongo", "redis", "postgres", "mysql", "sqlite", "oracle", "db2", "cassandra", "neo4j", "graph",
  "vertex", "edge", "tree", "leaf", "root", "branch", "child", "parent", "sibling", "ancestor",
  "descendant", "search", "sort", "merge", "quick", "heap", "bubble", "insertion", "selection",
  "dynamic", "greedy", "backtracking", "divide", "conquer", "brute", "force", "random", "seed",
  "hash", "map", "set", "list", "queue", "deque", "stack", "priority", "graph", "trie"
];

// Placeholder for type compatibility if needed, but we mainly use WORD_BANK now
export const SNIPPETS: Snippet[] = [
  {
    id: 'infinite-stream',
    title: 'INFINITE STREAM',
    category: 'CODE',
    difficulty: 'Hard',
    text: "Infinite Stream",
  }
];
