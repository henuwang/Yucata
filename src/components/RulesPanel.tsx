import { RULE_SECTIONS, type RuleBlock } from '../data/rules'

function Block({ block }: { block: RuleBlock }) {
  if (block.kind === 'para') {
    return (
      <p style={{ color: '#bbb', fontSize: 13, lineHeight: 1.8, margin: '0 0 10px 0' }}>
        {block.text}
      </p>
    )
  }

  const Tag = block.kind === 'ol' ? 'ol' : 'ul'
  return (
    <div style={{ marginBottom: 12 }}>
      {block.heading && (
        <div style={{ color: '#8ab4d8', fontSize: 13, fontWeight: 600, margin: '0 0 6px 0' }}>
          {block.heading}
        </div>
      )}
      <Tag style={{ margin: 0, paddingLeft: 20, color: '#bbb', fontSize: 13, lineHeight: 1.8 }}>
        {block.items?.map((item, i) => (
          <li key={i} style={{ marginBottom: 6 }}>
            {item.text}
            {item.subs && (
              <ul style={{ margin: '4px 0 0 0', paddingLeft: 18, color: '#999', fontSize: 12 }}>
                {item.subs.map((sub, j) => (
                  <li key={j} style={{ marginBottom: 4 }}>{sub}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </Tag>
    </div>
  )
}

export function RulesPanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#1a1a2e',
          border: '1px solid #4a7db5',
          borderRadius: 16,
          maxWidth: 720,
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #2a2a4a',
          flexShrink: 0,
        }}>
          <h2 style={{ color: '#e0e0e0', fontSize: 18, margin: 0, letterSpacing: 2 }}>
            📖 游戏规则
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              fontSize: 20,
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: '20px 24px' }}>
          {RULE_SECTIONS.map(section => (
            <section key={section.id} style={{ marginBottom: 24 }}>
              <h3 style={{
                color: '#e0e0e0',
                fontSize: 15,
                margin: '0 0 10px 0',
                paddingBottom: 6,
                borderBottom: '1px solid #2a2a4a',
              }}>
                {section.id}. {section.title}
              </h3>
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </section>
          ))}
        </div>

        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #2a2a4a',
          textAlign: 'center',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#2a2a4a',
              border: '1px solid #4a4a6a',
              borderRadius: 10,
              padding: '10px 40px',
              color: '#e0e0e0',
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
