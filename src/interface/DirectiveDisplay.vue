<script setup lang="ts">
interface BinaryResult {
  binary: string;
  status: 'directive' | 'failed';
  stdout: string;
  exitCode: number | null;
  errorCode?: string;
  durationMs: number;
  timedOut: boolean;
  truncated: boolean;
}

interface DirectiveBundle {
  schema: 'bdirectus.directive-bundle.v1';
  generatedAt: string;
  collection: string;
  results: BinaryResult[];
}

const props = defineProps<{
  value?: DirectiveBundle | null;
  disabled?: boolean;
}>();

function isBundle(value: unknown): value is DirectiveBundle {
  return typeof value === 'object'
    && value !== null
    && (value as DirectiveBundle).schema === 'bdirectus.directive-bundle.v1'
    && Array.isArray((value as DirectiveBundle).results);
}
</script>

<template>
  <section
    class="bdirectus-directive"
    :aria-disabled="props.disabled === true"
  >
    <p
      v-if="props.value == null"
      class="bdirectus-directive__empty"
    >
      No directive has been recorded for this item.
    </p>

    <p
      v-else-if="!isBundle(props.value)"
      class="bdirectus-directive__error"
    >
      The saved directive bundle is not readable by this extension version.
    </p>

    <div
      v-else
      class="bdirectus-directive__bundle"
    >
      <header class="bdirectus-directive__header">
        <strong>{{ props.value.collection }}</strong>
        <span>{{ props.value.generatedAt }}</span>
      </header>

      <article
        v-for="result in props.value.results"
        :key="result.binary"
        class="bdirectus-directive__result"
      >
        <header class="bdirectus-directive__result-header">
          <span class="bdirectus-directive__binary">{{ result.binary }}</span>
          <span
            class="bdirectus-directive__badge"
            :data-status="result.status"
          >{{ result.status }}</span>
        </header>
        <pre class="bdirectus-directive__stdout">{{ result.stdout }}</pre>
        <footer class="bdirectus-directive__meta">
          <span>exit: {{ result.exitCode ?? 'none' }}</span>
          <span>{{ result.durationMs }}ms</span>
          <span v-if="result.errorCode">{{ result.errorCode }}</span>
          <span v-if="result.timedOut">timeout</span>
          <span v-if="result.truncated">truncated</span>
        </footer>
      </article>
    </div>
  </section>
</template>

<style scoped>
.bdirectus-directive {
  display: grid;
  gap: 12px;
  max-width: 100%;
}

.bdirectus-directive__empty,
.bdirectus-directive__error {
  margin: 0;
  color: var(--theme--foreground-subdued, #667085);
}

.bdirectus-directive__error {
  color: var(--theme--danger, #c92a2a);
}

.bdirectus-directive__bundle,
.bdirectus-directive__result {
  display: grid;
  gap: 10px;
}

.bdirectus-directive__header,
.bdirectus-directive__result-header,
.bdirectus-directive__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.bdirectus-directive__result {
  padding: 12px;
  border: 1px solid var(--theme--border-color, #d0d5dd);
  border-radius: 8px;
}

.bdirectus-directive__binary {
  font-weight: 700;
}

.bdirectus-directive__badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--theme--background-accent, #f2f4f7);
}

.bdirectus-directive__badge[data-status='failed'] {
  color: var(--theme--danger, #c92a2a);
}

.bdirectus-directive__stdout {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: inherit;
}

.bdirectus-directive__meta {
  color: var(--theme--foreground-subdued, #667085);
  font-size: 12px;
}
</style>
