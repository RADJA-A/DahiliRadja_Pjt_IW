loadInscriptions() {
  this.loading = true;
  this.errorMessage = '';

  if (!this.user?.id) {
    this.errorMessage = 'Utilisateur non identifié';
    this.loading = false;
    return;
  }

  // Utilisez la méthode simplifiée qui retourne seulement les infos événement
  this.inscriptionService.getMesInscriptionsEvenement(this.user.id).subscribe({
    next: (inscriptions) => {
      this.inscriptions = inscriptions;
      console.log('Inscriptions avec infos événement chargées:', this.inscriptions);
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur lors du chargement des inscriptions:', err);
      this.errorMessage = 'Impossible de charger vos inscriptions';
      this.loading = false;
    }
  });
}