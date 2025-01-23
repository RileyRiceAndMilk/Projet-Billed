export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'long' }).format(date) // Utilisation de 'long' pour le mois en entier
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  return `${parseInt(da)} ${mo} ${ye}`
}

 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
  }
}