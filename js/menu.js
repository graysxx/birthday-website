const MENU = [
  {
    id: 'eat', emoji: '🍽️', title: 'Something to eat',
    desc: 'Pick something you’d like to eat.',
    items: [
      { emoji: '🍣', label: 'Sushi' },
      { emoji: '🍕', label: 'Pizza' },
      { emoji: '🍜', label: 'Ramen' },
      { emoji: '🍰', label: 'Cake' },
      { emoji: '🍨', label: 'Ice cream' },
      { emoji: '🍝', label: 'Pasta' },
      { emoji: '🍩', label: 'Donut' },
      { emoji: '✍️', label: 'Write your own', custom: true },
    ],
  },
  {
    id: 'drink', emoji: '☕', title: 'Something to drink',
    desc: 'Pick something you’d like to drink.',
    items: [
      { emoji: '☕', label: 'Coffee' },
      { emoji: '🍵', label: 'Milk tea' },
      { emoji: '🍫', label: 'Tea' },
      { emoji: '🧉', label: 'Matcha' },
      { emoji: '✍️', label: 'Write your own', custom: true },
    ],
  },
  {
    id: 'want', emoji: '🎁', title: 'Something you want',
    desc: 'Tell me what you’d like to have.',
    direct: true,
    placeholder: 'Write what you want...',
    items: [],
  },
];