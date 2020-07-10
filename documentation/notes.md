### <a name="notes"></a> Notes 
#### Unengaged Features 
The following features have been built but not implemented:

A Centralized Store for Observables

The library itself is exposed as an API from which Observables can be instantiated on the fly; this centralizes a "store" of all active Observables for easy management and greater control granularity.

*How does this work?*

*Vivisector* recursively points child objects at its own prototype so as to expose an internal library of methods; this subset of methods is therefore ubiquitous to *all* *Observables*. The internal prototype also maintains a list of all *Observables* extant in a given code-base. This is a powerful feature that allows you to centralize a singular source-of-truth for managing your *Observables*.

#### Imminent Todos

  - build out `cast` method on base prototype for handling observable transfers
  - error handling
  - enumerate event-listeners method on all *Observables* (see: jQuery 1.1.0 source's `data` method)
