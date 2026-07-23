<script setup lang="ts">
// A horizontal "number-line" pipeline diagram.
// Each node sits equally spaced along the axis. Optionally attach a branch
// annotation (title + description) above any node, with a short connector.
//
// Example:
//   <Pipeline :nodes="[
//     { label: 'ソースコード', branch: { title: 'ソースコード計測',
//         desc: ['コンパイル前にソースを', '書き換えてカウンタを挿入'] } },
//     { label: 'コンパイル', muted: true },
//     { label: '実行', branch: { title: 'バイナリ計測',
//         desc: ['実行中のバイナリを外から監視し、', 'どこが実行されたか記録する'] } },
//   ]" />
type Branch = { title: string, desc?: string[] | string }
type Node = { label: string, muted?: boolean, branch?: Branch }

const props = withDefaults(defineProps<{
  nodes: Node[]
  maxWidth?: number
}>(), {
  maxWidth: 1660,
})

function posX(i: number): number {
  const n = props.nodes.length
  if (n === 1) return 50
  // 12% margin on both ends, evenly space nodes in between (matches design).
  const margin = 12
  return margin + (i * (100 - 2 * margin)) / (n - 1)
}
function descLines(d?: Branch['desc']): string[] {
  if (!d) return []
  return Array.isArray(d) ? d : [d]
}
</script>

<template>
  <div class="pipeline" :style="{ maxWidth: `${maxWidth}px` }">
    <template v-for="(n, i) in nodes" :key="i">
      <div
        v-if="n.branch"
        class="branch"
        :style="{ left: `${posX(i)}%` }"
      >
        <div class="label">{{ n.branch.title }}</div>
        <div class="desc">
          <template v-for="(d, di) in descLines(n.branch.desc)" :key="di">
            <template v-if="di">
              <br />
            </template>
            {{ d }}
          </template>
        </div>
        <div class="tick" />
      </div>
    </template>
    <div class="line" />
    <template v-for="(n, i) in nodes" :key="`n${i}`">
      <div
        class="node"
        :class="{ muted: n.muted }"
        :style="{ left: `${posX(i)}%` }"
      />
      <div class="caption" :style="{ left: `${posX(i)}%` }">{{ n.label }}</div>
    </template>
    <template v-for="(_, i) in nodes.slice(0, -1)" :key="`a${i}`">
      <div
        class="arrow"
        :style="{ left: `${(posX(i) + posX(i + 1)) / 2}%` }"
      />
    </template>
  </div>
</template>

<style scoped>
.pipeline {
  position: relative;
  width: 100%;
  height: 340px;
  margin: 12px 0 6px;
  font-family: 'Noto Sans JP', sans-serif;
}
.line {
  position: absolute;
  top: 220px;
  left: 12%;
  right: 12%;
  height: 4px;
  background: #c4ccd0;
}
.node {
  position: absolute;
  top: 220px;
  width: 28px;
  height: 28px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: #0a7c98;
}
.node.muted {
  width: 22px;
  height: 22px;
  background: #8a8f95;
}
.arrow {
  position: absolute;
  top: 220px;
  width: 20px;
  height: 20px;
  border-right: 4px solid #c4ccd0;
  border-bottom: 4px solid #c4ccd0;
  transform: translate(-50%, -50%) rotate(-45deg);
}
.caption {
  position: absolute;
  top: 250px;
  transform: translateX(-50%);
  font-size: 32px;
  color: #3a4046;
  white-space: nowrap;
}
.branch {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  text-align: center;
}
.branch .label {
  font-size: 32px;
  font-weight: 700;
  color: #0a7c98;
  line-height: 1.3;
}
.branch .desc {
  margin-top: 12px;
  font-size: 27px;
  color: #5a6066;
  line-height: 1.35;
  white-space: nowrap;
}
.branch .tick {
  position: absolute;
  left: 50%;
  bottom: -60px;
  transform: translateX(-50%);
  width: 4px;
  height: 40px;
  background: #0a7c98;
}
</style>
