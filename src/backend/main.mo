import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type CatalogEntry = {
    id : Text;
    name : Text;
    imageUrl : Text;
    order : Nat;
  };

  module CatalogEntry {
    public func compare(entry1 : CatalogEntry, entry2 : CatalogEntry) : Order.Order {
      switch (Nat.compare(entry1.order, entry2.order)) {
        case (#equal) { Text.compare(entry1.id, entry2.id) };
        case (order) { order };
      };
    };
  };

  let heroes = Map.empty<Text, CatalogEntry>();
  let branches = Map.empty<Text, CatalogEntry>();
  let items = Map.empty<Text, CatalogEntry>();

  public shared ({ caller }) func initializeCatalogs() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize catalogs");
    };
    if (heroes.size() > 0) { Runtime.trap("Already initialized") };

    // Seed heroes (1-65)
    for (i in Nat.range(1, 65)) {
      let hero : CatalogEntry = {
        id = "hero_" # i.toText();
        name = "Герой " # i.toText();
        imageUrl = "https://say-gg.ru/static/heroes/" # i.toText() # ".jpg";
        order = i;
      };
      heroes.add(hero.id, hero);
    };

    // Seed branches
    let branchData = [
      ("attack", "АТАКА"),
      ("crit", "КРИТ"),
      ("dodge", "ДОДЖ"),
      ("freeze", "ЗАМОРОЗКА"),
      ("haste", "УСКОРЕНИЕ"),
      ("heal", "ИСЦЕЛЕНИЕ"),
      ("hp", "ХП"),
      ("poison", "ЯД"),
      ("rage", "ЯРОСТЬ"),
      ("shield", "ЩИТ"),
      ("sprite", "СПРАЙТ"),
      ("ultimate", "УЛЬТ"),
      ("wound", "РАНА"),
    ];

    for ((i, (id, name)) in branchData.enumerate()) {
      let branch : CatalogEntry = {
        id;
        name;
        imageUrl = "https://say-gg.ru/static/branches/" # id # ".png";
        order = i + 1;
      };
      branches.add(branch.id, branch);
    };

    // Seed items (1-99)
    for (i in Nat.range(1, 99)) {
      let item : CatalogEntry = {
        id = "item_" # i.toText();
        name = "Предмет " # i.toText();
        imageUrl = "https://say-gg.ru/static/items/" # i.toText() # ".jpg";
        order = i;
      };
      items.add(item.id, item);
    };
  };

  // Query functions - accessible to all users including guests
  public query ({ caller }) func getHeroes() : async [CatalogEntry] {
    heroes.values().toArray().sort();
  };

  public query ({ caller }) func getBranches() : async [CatalogEntry] {
    branches.values().toArray().sort();
  };

  public query ({ caller }) func getItems() : async [CatalogEntry] {
    items.values().toArray().sort();
  };

  // Private helper functions for catalog management
  func addOrUpdateCatalogEntry(caller : Principal, map : Map.Map<Text, CatalogEntry>, id : Text, name : Text, imageUrl : Text, order : Nat) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let entry : CatalogEntry = {
      id;
      name;
      imageUrl;
      order;
    };
    map.add(id, entry);
  };

  func deleteCatalogEntry(caller : Principal, map : Map.Map<Text, CatalogEntry>, id : Text) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not map.containsKey(id)) { Runtime.trap("Catalog entry not found") };
    map.remove(id);
  };

  // Admin-only hero management functions
  public shared ({ caller }) func addHero(name : Text, imageUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let order = heroes.size() + 1;
    let id = "hero_" # order.toText();
    addOrUpdateCatalogEntry(caller, heroes, id, name, imageUrl, order);
  };

  public shared ({ caller }) func updateHero(id : Text, name : Text, imageUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (heroes.get(id)) {
      case null { Runtime.trap("Hero not found") };
      case (?existing) {
        addOrUpdateCatalogEntry(caller, heroes, id, name, imageUrl, existing.order);
      };
    };
  };

  public shared ({ caller }) func deleteHero(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    deleteCatalogEntry(caller, heroes, id);
  };

  // Admin-only branch management functions
  public shared ({ caller }) func addBranch(name : Text, imageUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let order = branches.size() + 1;
    let id = name # "_" # order.toText(); // Remove Text.toLowercase
    addOrUpdateCatalogEntry(caller, branches, id, name, imageUrl, order);
  };

  public shared ({ caller }) func updateBranch(id : Text, name : Text, imageUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (branches.get(id)) {
      case null { Runtime.trap("Branch not found") };
      case (?existing) {
        addOrUpdateCatalogEntry(caller, branches, id, name, imageUrl, existing.order);
      };
    };
  };

  public shared ({ caller }) func deleteBranch(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    deleteCatalogEntry(caller, branches, id);
  };

  // Admin-only item management functions
  public shared ({ caller }) func addItem(name : Text, imageUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let order = items.size() + 1;
    let id = "item_" # order.toText();
    addOrUpdateCatalogEntry(caller, items, id, name, imageUrl, order);
  };

  public shared ({ caller }) func updateItem(id : Text, name : Text, imageUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (items.get(id)) {
      case null { Runtime.trap("Item not found") };
      case (?existing) {
        addOrUpdateCatalogEntry(caller, items, id, name, imageUrl, existing.order);
      };
    };
  };

  public shared ({ caller }) func deleteItem(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    deleteCatalogEntry(caller, items, id);
  };
};
