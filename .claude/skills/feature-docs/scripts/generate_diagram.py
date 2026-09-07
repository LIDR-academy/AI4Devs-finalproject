#!/usr/bin/env python3
"""
generate_diagram.py — Feature Documentation Generator helper script
====================================================================
Generates architecture diagram PNGs using the `mingrammer/diagrams` library.

Two modes:
  1. --spec JSON    : Declarative JSON spec → agent provides node list, edges, clusters
  2. --script FILE  : Execute a custom .py diagram script for complex topologies

Usage examples:
  # Declarative mode (simple topologies)
  python3 generate_diagram.py \\
    --spec '{"title":"User Auth Flow","output":"auth_arch","nodes":[...]}' \\
    --outdir docs/diagrams/

  # Script mode (complex topologies)
  python3 generate_diagram.py \\
    --script /tmp/my_diagram.py \\
    --outdir docs/diagrams/

JSON Spec Schema:
  {
    "title":   str,           # Diagram title (also used as filename if output omitted)
    "output":  str,           # Output filename without extension (optional)
    "direction": str,         # "LR" | "TB" | "RL" | "BT"  (default: "LR")
    "outformat": str,         # "png" | "svg" | "pdf"       (default: "png")
    "nodes": [
      {
        "id":       str,      # Unique node identifier (used in edges)
        "label":    str,      # Display label
        "type":     str,      # Node type string — see NODE_CATALOG below
        "cluster":  str       # Optional cluster/group name
      }
    ],
    "edges": [
      {
        "from":  str,         # Source node id
        "to":    str,         # Target node id
        "label": str          # Optional edge label (default: "")
      }
    ]
  }

NODE_CATALOG (type strings for --spec mode):
  AWS:
    aws.compute.EC2            aws.compute.Lambda         aws.compute.ECS
    aws.compute.EKS            aws.compute.Fargate        aws.compute.AppRunner
    aws.database.RDS           aws.database.Aurora        aws.database.DDB
    aws.database.ElastiCache   aws.database.Redshift      aws.database.DocumentDB
    aws.network.APIGateway     aws.network.CloudFront     aws.network.ELB
    aws.network.Route53        aws.network.VPC
    aws.storage.S3             aws.storage.EFS            aws.storage.Glacier
    aws.integration.SQS        aws.integration.SNS        aws.integration.Eventbridge
    aws.security.Cognito       aws.security.WAF           aws.security.KMS
    aws.management.Cloudwatch  aws.management.Cloudtrail
  GCP:
    gcp.compute.GCE            gcp.compute.GKE            gcp.compute.CloudRun
    gcp.database.SQL           gcp.database.Firestore     gcp.database.Bigtable
    gcp.network.LoadBalancing  gcp.network.CDN
    gcp.storage.GCS
  Azure:
    azure.compute.VM           azure.compute.AKS          azure.compute.FunctionApps
    azure.database.SQL         azure.database.CosmosDb
    azure.network.ApplicationGateway
    azure.storage.BlobStorage
  Kubernetes:
    k8s.compute.Pod            k8s.compute.Deployment     k8s.compute.StatefulSet
    k8s.network.Ingress        k8s.network.Service
    k8s.storage.PV             k8s.storage.PVC
  On-Premises / Generic:
    onprem.compute.Server      onprem.database.PostgreSQL onprem.database.MySQL
    onprem.database.MongoDB    onprem.queue.Kafka         onprem.queue.RabbitMQ
    onprem.network.Nginx       onprem.network.HAProxy
    onprem.monitoring.Grafana  onprem.monitoring.Prometheus
    onprem.client.Users        onprem.client.User
    generic.compute.Rack       generic.network.Firewall   generic.storage.Storage
  SaaS / Programming:
    saas.analytics.Datadog     saas.chat.Slack
    programming.language.Python  programming.language.Javascript
"""

import argparse
import importlib
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path


# ---------------------------------------------------------------------------
# Node type registry
# ---------------------------------------------------------------------------

NODE_REGISTRY = {
    # AWS Compute
    "aws.compute.EC2":            ("diagrams.aws.compute",       "EC2"),
    "aws.compute.Lambda":         ("diagrams.aws.compute",       "Lambda"),
    "aws.compute.ECS":            ("diagrams.aws.compute",       "ECS"),
    "aws.compute.EKS":            ("diagrams.aws.compute",       "EKS"),
    "aws.compute.Fargate":        ("diagrams.aws.compute",       "Fargate"),
    "aws.compute.AppRunner":      ("diagrams.aws.compute",       "AppRunner"),
    # AWS Database
    "aws.database.RDS":           ("diagrams.aws.database",      "RDS"),
    "aws.database.Aurora":        ("diagrams.aws.database",      "Aurora"),
    "aws.database.DDB":           ("diagrams.aws.database",      "DDB"),
    "aws.database.ElastiCache":   ("diagrams.aws.database",      "ElastiCache"),
    "aws.database.Redshift":      ("diagrams.aws.database",      "Redshift"),
    "aws.database.DocumentDB":    ("diagrams.aws.database",      "DocumentDB"),
    # AWS Network
    "aws.network.APIGateway":     ("diagrams.aws.network",       "APIGateway"),
    "aws.network.CloudFront":     ("diagrams.aws.network",       "CloudFront"),
    "aws.network.ELB":            ("diagrams.aws.network",       "ELB"),
    "aws.network.Route53":        ("diagrams.aws.network",       "Route53"),
    "aws.network.VPC":            ("diagrams.aws.network",       "VPC"),
    # AWS Storage
    "aws.storage.S3":             ("diagrams.aws.storage",       "S3"),
    "aws.storage.EFS":            ("diagrams.aws.storage",       "EFS"),
    "aws.storage.Glacier":        ("diagrams.aws.storage",       "Glacier"),
    # AWS Integration
    "aws.integration.SQS":        ("diagrams.aws.integration",   "SQS"),
    "aws.integration.SNS":        ("diagrams.aws.integration",   "SNS"),
    "aws.integration.Eventbridge":("diagrams.aws.integration",   "Eventbridge"),
    # AWS Security
    "aws.security.Cognito":       ("diagrams.aws.security",      "Cognito"),
    "aws.security.WAF":           ("diagrams.aws.security",      "WAF"),
    "aws.security.KMS":           ("diagrams.aws.security",      "KMS"),
    # AWS Management
    "aws.management.Cloudwatch":  ("diagrams.aws.management",    "Cloudwatch"),
    "aws.management.Cloudtrail":  ("diagrams.aws.management",    "Cloudtrail"),
    # GCP
    "gcp.compute.GCE":            ("diagrams.gcp.compute",       "GCE"),
    "gcp.compute.GKE":            ("diagrams.gcp.compute",       "GKE"),
    "gcp.compute.CloudRun":       ("diagrams.gcp.compute",       "CloudRun"),
    "gcp.database.SQL":           ("diagrams.gcp.database",      "SQL"),
    "gcp.database.Firestore":     ("diagrams.gcp.database",      "Firestore"),
    "gcp.database.Bigtable":      ("diagrams.gcp.database",      "Bigtable"),
    "gcp.network.LoadBalancing":  ("diagrams.gcp.network",       "LoadBalancing"),
    "gcp.network.CDN":            ("diagrams.gcp.network",       "CDN"),
    "gcp.storage.GCS":            ("diagrams.gcp.storage",       "GCS"),
    # Azure
    "azure.compute.VM":                    ("diagrams.azure.compute", "VM"),
    "azure.compute.AKS":                   ("diagrams.azure.compute", "AKS"),
    "azure.compute.FunctionApps":          ("diagrams.azure.compute", "FunctionApps"),
    "azure.database.SQL":                  ("diagrams.azure.database","SQL"),
    "azure.database.CosmosDb":             ("diagrams.azure.database","CosmosDb"),
    "azure.network.ApplicationGateway":    ("diagrams.azure.network", "ApplicationGateway"),
    "azure.storage.BlobStorage":           ("diagrams.azure.storage", "BlobStorage"),
    # Kubernetes
    "k8s.compute.Pod":            ("diagrams.k8s.compute",       "Pod"),
    "k8s.compute.Deployment":     ("diagrams.k8s.compute",       "Deployment"),
    "k8s.compute.StatefulSet":    ("diagrams.k8s.compute",       "StatefulSet"),
    "k8s.network.Ingress":        ("diagrams.k8s.network",       "Ingress"),
    "k8s.network.Service":        ("diagrams.k8s.network",       "Service"),
    "k8s.storage.PV":             ("diagrams.k8s.storage",       "PV"),
    "k8s.storage.PVC":            ("diagrams.k8s.storage",       "PVC"),
    # On-prem / generic
    "onprem.compute.Server":      ("diagrams.onprem.compute",    "Server"),
    "onprem.database.PostgreSQL": ("diagrams.onprem.database",   "PostgreSQL"),
    "onprem.database.MySQL":      ("diagrams.onprem.database",   "MySQL"),
    "onprem.database.MongoDB":    ("diagrams.onprem.database",   "MongoDB"),
    "onprem.queue.Kafka":         ("diagrams.onprem.queue",      "Kafka"),
    "onprem.queue.RabbitMQ":      ("diagrams.onprem.queue",      "RabbitMQ"),
    "onprem.network.Nginx":       ("diagrams.onprem.network",    "Nginx"),
    "onprem.network.HAProxy":     ("diagrams.onprem.network",    "HAProxy"),
    "onprem.monitoring.Grafana":  ("diagrams.onprem.monitoring", "Grafana"),
    "onprem.monitoring.Prometheus":("diagrams.onprem.monitoring","Prometheus"),
    "onprem.client.Users":        ("diagrams.onprem.client",     "Users"),
    "onprem.client.User":         ("diagrams.onprem.client",     "User"),
    "generic.compute.Rack":       ("diagrams.generic.compute",   "Rack"),
    "generic.network.Firewall":   ("diagrams.generic.network",   "Firewall"),
    "generic.storage.Storage":    ("diagrams.generic.storage",   "Storage"),
    # SaaS
    "saas.analytics.Datadog":     ("diagrams.saas.analytics",    "Datadog"),
    "saas.chat.Slack":            ("diagrams.saas.chat",         "Slack"),
    # Programming
    "programming.language.Python":     ("diagrams.programming.language", "Python"),
    "programming.language.Javascript": ("diagrams.programming.language", "Javascript"),
}

FALLBACK_NODE = ("diagrams.generic.compute", "Rack")


def resolve_node_class(type_str: str):
    """Import and return the node class for a given type string."""
    entry = NODE_REGISTRY.get(type_str)
    if entry is None:
        print(f"  ⚠  Unknown node type '{type_str}', using generic fallback.", file=sys.stderr)
        entry = FALLBACK_NODE
    module_path, class_name = entry
    try:
        mod = importlib.import_module(module_path)
        return getattr(mod, class_name)
    except (ImportError, AttributeError) as exc:
        print(f"  ⚠  Could not load {module_path}.{class_name}: {exc}. Using fallback.", file=sys.stderr)
        mod = importlib.import_module(FALLBACK_NODE[0])
        return getattr(mod, FALLBACK_NODE[1])


# ---------------------------------------------------------------------------
# Check prerequisites
# ---------------------------------------------------------------------------

def check_prerequisites() -> bool:
    """Return True if all prerequisites are satisfied."""
    ok = True

    # diagrams library
    try:
        import diagrams  # noqa: F401
    except ImportError:
        print("❌ 'diagrams' library not found.", file=sys.stderr)
        print("   Install: pip install diagrams --break-system-packages", file=sys.stderr)
        ok = False

    # Graphviz binary
    try:
        result = subprocess.run(["dot", "-V"], capture_output=True, timeout=5)
        if result.returncode != 0:
            raise FileNotFoundError
    except (FileNotFoundError, subprocess.TimeoutExpired):
        print("❌ Graphviz 'dot' binary not found.", file=sys.stderr)
        print("   Linux:  sudo apt-get install graphviz -y", file=sys.stderr)
        print("   macOS:  brew install graphviz", file=sys.stderr)
        print("   Windows: https://graphviz.org/download/", file=sys.stderr)
        ok = False

    return ok


# ---------------------------------------------------------------------------
# Declarative spec → diagram
# ---------------------------------------------------------------------------

def build_from_spec(spec: dict, outdir: str) -> str:
    """Generate a diagram from a JSON spec. Returns output file path."""
    from diagrams import Diagram, Cluster, Edge

    title = spec.get("title", "Architecture Diagram")
    output_name = spec.get("output", title.lower().replace(" ", "_"))
    direction = spec.get("direction", "LR")
    outformat = spec.get("outformat", "png")
    nodes_spec = spec.get("nodes", [])
    edges_spec = spec.get("edges", [])

    # Ensure output dir exists
    os.makedirs(outdir, exist_ok=True)
    output_path = os.path.join(outdir, output_name)

    # Group nodes by cluster
    clusters: dict[str, list] = {}
    no_cluster = []
    for n in nodes_spec:
        cluster = n.get("cluster")
        if cluster:
            clusters.setdefault(cluster, []).append(n)
        else:
            no_cluster.append(n)

    # Build diagram
    with Diagram(
        title,
        show=False,
        direction=direction,
        outformat=outformat,
        filename=output_path,
    ):
        node_map: dict[str, object] = {}

        # Nodes without cluster
        for n in no_cluster:
            NodeClass = resolve_node_class(n["type"])
            node_map[n["id"]] = NodeClass(n.get("label", n["id"]))

        # Clustered nodes
        for cluster_name, cluster_nodes in clusters.items():
            with Cluster(cluster_name):
                for n in cluster_nodes:
                    NodeClass = resolve_node_class(n["type"])
                    node_map[n["id"]] = NodeClass(n.get("label", n["id"]))

        # Edges
        for e in edges_spec:
            src = node_map.get(e["from"])
            dst = node_map.get(e["to"])
            if src is None or dst is None:
                print(f"  ⚠  Edge skipped: '{e['from']}' → '{e['to']}' — node id not found.", file=sys.stderr)
                continue
            label = e.get("label", "")
            if label:
                src >> Edge(label=label) >> dst
            else:
                src >> dst

    final_path = f"{output_path}.{outformat}"
    return final_path


# ---------------------------------------------------------------------------
# Script mode
# ---------------------------------------------------------------------------

def run_script(script_path: str, outdir: str) -> None:
    """Execute a standalone diagram script, redirecting output to outdir."""
    if not os.path.isfile(script_path):
        print(f"❌ Script not found: {script_path}", file=sys.stderr)
        sys.exit(1)

    os.makedirs(outdir, exist_ok=True)
    # Run the script from outdir so relative filenames land there
    result = subprocess.run(
        [sys.executable, os.path.abspath(script_path)],
        cwd=outdir,
        capture_output=True,
        text=True,
    )
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    if result.returncode != 0:
        print(f"❌ Script exited with code {result.returncode}", file=sys.stderr)
        sys.exit(result.returncode)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate architecture diagrams using mingrammer/diagrams."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--spec",
        type=str,
        help="JSON spec string describing nodes and edges.",
    )
    group.add_argument(
        "--spec-file",
        type=str,
        help="Path to a JSON spec file.",
    )
    group.add_argument(
        "--script",
        type=str,
        help="Path to a custom Python diagram script.",
    )
    parser.add_argument(
        "--outdir",
        type=str,
        default="docs/diagrams",
        help="Output directory for generated diagram files (default: docs/diagrams).",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Only check prerequisites and exit.",
    )
    args = parser.parse_args()

    if args.check or not check_prerequisites():
        if args.check and check_prerequisites():
            print("✅ All prerequisites satisfied.")
        sys.exit(0 if check_prerequisites() else 1)

    # Script mode
    if args.script:
        print(f"▶ Running diagram script: {args.script}")
        run_script(args.script, args.outdir)
        print(f"✅ Diagram(s) written to: {args.outdir}/")
        return

    # Spec mode
    if args.spec_file:
        with open(args.spec_file) as f:
            spec = json.load(f)
    else:
        try:
            spec = json.loads(args.spec)
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON spec: {e}", file=sys.stderr)
            sys.exit(1)

    print(f"▶ Generating diagram: {spec.get('title', 'Architecture Diagram')}")
    output_file = build_from_spec(spec, args.outdir)
    print(f"✅ Diagram saved: {output_file}")


if __name__ == "__main__":
    main()
