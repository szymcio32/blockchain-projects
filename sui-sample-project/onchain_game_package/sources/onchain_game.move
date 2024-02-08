module onchain_game_package::onchain_game {
    use std::option::{Self, Option};
    use std::string::{Self, String};

    use sui::dynamic_object_field as dof;
    use sui::event::emit;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};

    const REVERT_CODE: u64 = 0;
    const SUCCESS_CODE: u64 = 1;

    // User who holds this object is considered as an admin
    struct GameAdminCap has key { id: UID }

    struct Hero has key {
        id: UID,
        name: String,
        level: u64,
        url: Url,
        sword: Option<Sword>,
        equipment_count: u8,
    }

    struct Sword has key, store {
        id: UID,
        attack: u64
    }

    struct Equipment has key, store {
        id: UID,
        name: String
    }

    // Event. Emitted when a new equipment is added to a hero.
    struct EquipmentAdded<phantom T> has copy, drop {
        hero_id: ID,
        equipment_id: ID
    }

    // Event. Emitted when an equipment is taken off.
    struct EquipmentRemoved<phantom T> has copy, drop {
        hero_id: ID,
        equipment_id: ID,
    }

    // constructor - creating the GameAdminCap object and sending it to the deployer
    fun init(ctx: &mut TxContext) {
        transfer::transfer(
            GameAdminCap {id: object::new(ctx)}
        , tx_context::sender(ctx))
    }

    // Hero
    public fun name(self: &Hero): String {
        self.name
    }

    public fun level(self: &Hero): u64 {
        self.level
    }

    public fun hero_url(self: &Hero): Url {
        self.url
    }

    public fun equipment_count(self: &Hero): u8 {
        self.equipment_count
    }

    // Sword
    public fun attack(self: &Sword): u64 {
        self.attack
    }

    // Equipment
    public fun equipment_name(self: &Equipment): String {
        self.name
    }

    // the syntax `_: &GameAdminCap` means that only the owner of the GameAdminCap object can invoke this function (wich is the admin)
    public entry fun create_sword(_: &GameAdminCap, player: address, attack: u64, ctx: &mut TxContext) {
        let sword = Sword {
            id: object::new(ctx),
            attack,
        };
        transfer::transfer(sword, player);
    }

    public entry fun create_equipment_item(_: &GameAdminCap, player: address, name: vector<u8>, ctx: &mut TxContext) {
        let item = Equipment {
            id: object::new(ctx),
            name: string::utf8(name),
        };
        transfer::transfer(item, player);
    }

    public entry fun create_hero(_: &GameAdminCap, player: address, name: vector<u8>, url: vector<u8>, ctx: &mut TxContext) {
        let hero = Hero {
            id: object::new(ctx),
            name: string::utf8(name),
            level: 1,
            url: url::new_unsafe_from_bytes(url),
            sword: option::none(),
            equipment_count: 0
        };

        transfer::transfer(hero, player);
    }

    public entry fun equip_sword(hero: &mut Hero, sword: Sword, ctx: &mut TxContext) {
        // Sword is an object without drop ability
        // If hero has already a sword equipped, that sword cannot just be dropped.
        // We first need to check if there is already a sword equipped,
        // and if so, we take it out and send it back to the sender.
        if (option::is_some(&hero.sword)) {
            let old_sword = option::extract(&mut hero.sword);
            transfer::transfer(old_sword, tx_context::sender(ctx));
        };
        option::fill(&mut hero.sword, sword);
    }

    // Attach an Equpiment to a Hero
    // Function is generic and allows any app to attach items to Hero
    public entry fun add_item<T: key + store>(hero: &mut Hero, equpiment: T) {
        emit(EquipmentAdded<T> {
            hero_id: object::id(hero),
            equipment_id: object::id(&equpiment)
        });

        // This function takes the Equpiment object by value,
        // and makes it a dynamic field of Hero with a name of Equpiment object id
        dof::add(&mut hero.id, object::id(&equpiment), equpiment);

        hero.equipment_count = hero.equipment_count + 1;
    }

    // Remove an Equpiment from a Hero
    public entry fun remove_item<T: key + store>(hero: &mut Hero, equipment_id: ID, ctx: &TxContext) {
        emit(EquipmentRemoved<T> {
            hero_id: object::id(hero),
            equipment_id: *&equipment_id
        });

        let equipment = dof::remove<ID, T>(
            &mut hero.id,
            equipment_id,
        );
        transfer::transfer(equipment, tx_context::sender(ctx));

        hero.equipment_count = hero.equipment_count - 1;
    }

    #[test]
    public fun test_module_init() {
        use sui::test_scenario;

        // create test address representing admin and account
        let admin = @0xBABE;

        // first transaction to emulate module initialization
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        {
            init(test_scenario::ctx(scenario));
        };

        // second transaction to check if the GameAdminCap has been created for admin account
        test_scenario::next_tx(scenario, admin);
        {
            // extract the GameAdminCap object
            let game_admin_cap = test_scenario::take_from_sender<GameAdminCap>(scenario);
            // return the GameAdminCap object to the object pool
            test_scenario::return_to_sender(scenario, game_admin_cap);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_create_hero_with_sword() {
        use sui::test_scenario;

        let admin = @0xBABE;
        let player = @0xCAFE;

        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        {
            init(test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, admin);
        {
            let game_admin_cap = test_scenario::take_from_sender<GameAdminCap>(scenario);
            create_hero(&game_admin_cap, player, b"hero_1", b"https://some_url.com/", test_scenario::ctx(scenario));
            create_sword(&game_admin_cap, player, 22, test_scenario::ctx(scenario));
            test_scenario::return_to_sender(scenario, game_admin_cap);
        };

        // Check that admin does not own just created Hero and Sword objects
        test_scenario::next_tx(scenario, admin);
        {
            assert!(!test_scenario::has_most_recent_for_sender<Sword>(scenario), REVERT_CODE);
            assert!(!test_scenario::has_most_recent_for_sender<Hero>(scenario), REVERT_CODE);
        };

        // Check attributes of Hero and Sword objects created for player address
        test_scenario::next_tx(scenario, player);
        {
            let sword = test_scenario::take_from_sender<Sword>(scenario);
            let hero = test_scenario::take_from_sender<Hero>(scenario);

            assert!(attack(&sword) == 22, SUCCESS_CODE);
            assert!(
                name(&hero) == string::utf8(b"hero_1") &&
                level(&hero) == 1 &&
                hero_url(&hero) == url::new_unsafe_from_bytes(b"https://some_url.com/") &&
                equipment_count(&hero) == 0,
            SUCCESS_CODE);
            assert!(option::is_none(&hero.sword), REVERT_CODE);

            test_scenario::return_to_sender(scenario, sword);
            test_scenario::return_to_sender(scenario, hero);
        };

        // Check that Sword object is attached to Hero object
        test_scenario::next_tx(scenario, player);
        {
            let sword = test_scenario::take_from_sender<Sword>(scenario);
            let hero = test_scenario::take_from_sender<Hero>(scenario);

            equip_sword(&mut hero, sword,test_scenario::ctx(scenario));
            assert!(attack(option::borrow_mut(&mut hero.sword)) == 22, SUCCESS_CODE);

            test_scenario::return_to_sender(scenario, hero);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    public fun test_create_hero_with_custom_item() {
        use sui::test_scenario;

        let admin = @0xBABE;
        let player = @0xCAFE;

        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        {
            init(test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, admin);
        {
            let game_admin_cap = test_scenario::take_from_sender<GameAdminCap>(scenario);
            create_hero(&game_admin_cap, player, b"hero_1", b"https://some_url.com/", test_scenario::ctx(scenario));
            create_equipment_item(&game_admin_cap, player, b"boots", test_scenario::ctx(scenario));
            create_equipment_item(&game_admin_cap, player, b"armor", test_scenario::ctx(scenario));

            test_scenario::return_to_sender(scenario, game_admin_cap);
        };

        // Check attributes of Equipment object created for player address and attach it to Hero object
        test_scenario::next_tx(scenario, player);
        {
            let equipment_1 = test_scenario::take_from_sender<Equipment>(scenario);
            let equipment_2 = test_scenario::take_from_sender<Equipment>(scenario);
            let hero = test_scenario::take_from_sender<Hero>(scenario);

            assert!(equipment_name(&equipment_1) == string::utf8(b"armor"), SUCCESS_CODE);
            assert!(equipment_name(&equipment_2) == string::utf8(b"boots"), SUCCESS_CODE);
            assert!(equipment_count(&hero) == 0, SUCCESS_CODE);
            add_item(&mut hero, equipment_1);
            add_item(&mut hero, equipment_2);
            assert!(equipment_count(&hero) == 2, SUCCESS_CODE);

            test_scenario::return_to_sender(scenario, hero);
        };

        test_scenario::end(scenario_val);
    }
}
